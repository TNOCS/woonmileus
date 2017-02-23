module BoxPlot {
    /** Config */
    var moduleName = 'csComp';

    /** Module */
    export var myModule;
    try {
        myModule = angular.module(moduleName);
    } catch (err) {
        // named module does not exist, so create one
        myModule = angular.module(moduleName, []);
    }

    /** Directive to send a message to a REST endpoint. Similar in goal to the Chrome plugin POSTMAN. */
    myModule.directive('boxplotwidget', [function (): ng.IDirective {
        return {
            restrict: 'E', // E = elements, other options are A=attributes and C=classes
            scope: {}, // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
            templateUrl: 'widgets/BoxPlot.tpl.html',
            replace: true, // Remove the directive from the DOM
            transclude: false, // Add elements and attributes to the template
            controller: BoxPlotCtrl
        };
    }]);

    myModule.directive('showaspercentage', () => {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: (scope, element, attrs, ngModel) => {
                if (ngModel) {
                    ngModel.$parsers.push((value) => {
                        return (value / 100);
                    });
                    ngModel.$formatters.push((value) => {
                        return (value * 100);
                    });
                }
            }
        };
    });

    myModule.filter('nonumbers', [function () {
        return function (object) {
            let result = {};
            angular.forEach(object, function (value, key) {
                if (!isNaN(value)) {
                    result[key] = 'custom';
                } else {
                    result[key] = value;
                }
            });
            return result;
        };
    }]);

    import McaModel = Mca.Models.Mca;
    import Criterion = Mca.Models.Criterion;
    import Helpers = csComp.Helpers;
    import Project = csComp.Services.Project;
    import ProjectLayer = csComp.Services.ProjectLayer;
    import ProjectGroup = csComp.Services.ProjectGroup;
    import IFeatureType = csComp.Services.IFeatureType;
    import IFeature = csComp.Services.IFeature;

    export interface IBoxPlotScope extends ng.IScope {
        vm: BoxPlotCtrl;
        data: BoxPlotData;
        availableMcas: McaModel[];
        statsValues: {
            min: number,
            max: number,
            avg: number
        };
        statsScores: {
            min: number,
            max: number,
            avg: number
        };
        statsTotal: {
            min: number,
            max: number,
            avg: number
        };
        featureCount: {
            valid: number,
            invalid: number,
            total: number;
        };
        isNumber: Function;
        adaptCustom: Function;
        loadingSpinners: {
            mca: boolean;
        };
    }

    export interface BoxPlotData {
        layerId: string;
        title: string;
        hideTitle: boolean;
        canMinimize: boolean;
        autoUpdate: boolean;
    }

    export interface ICriterionCompleteness {
        criterionLength: number;
        maxUnknownPercentage: number;
    }


    export class BoxPlotCtrl {
        private mcaScope: Mca.IMcaScope;
        private widget: csComp.Services.IWidget;
        private parentWidget: JQuery;
        private parentWidgetId: string;
        private mBusHandles: csComp.Services.MessageBusHandle[] = [];
        private unknownValues: Dictionary < 'zero' | 'half' | 'average' | number > = {
            'Nul (0)': 'zero',
            'Half (0.5)': 'half',
            'Gemiddelde': 'average',
            'Aangepast': 0
        };
        private boundsValues: Dictionary < 'none' | '1.5_iqr' | '3_iqr' > = {
            'Aangepast (min/max)': 'none',
            '1.5x interkwartiel bereik': '1.5_iqr',
            '3x interkwartiel bereik': '3_iqr'
        };
        private selectedMca: McaModel;
        private selectedCriterionIndex: number = 0;
        private selectedCriterion: Criterion;
        private flatCriteria: Criterion[] = [];
        private criterionCompleteness: Dictionary < ICriterionCompleteness > = {};

        private charts: Dictionary < any > = {};
        private chartSvgs: Dictionary < any > = {};

        public static $inject = [
            '$scope',
            '$http',
            'layerService',
            'messageBusService',
            'actionService',
            '$timeout',
            '$sce',
            '$uibModal',
            '$translate'
        ];

        constructor(
            private $scope: IBoxPlotScope,
            private $http: ng.IHttpService,
            private $layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private actionService: csComp.Services.ActionService,
            private $timeout: ng.ITimeoutService,
            private $sce: ng.ISCEService,
            private $uibModal: ng.ui.bootstrap.IModalService,
            private $translate: ng.translate.ITranslateService
        ) {
            $scope.vm = this;
            var par = < any > $scope.$parent;
            this.widget = par.widget;
            this.parentWidgetId = `${this.widget.elementId}-parent`;
            this.parentWidget = $(`#${this.parentWidgetId}`);

            $scope.data = < BoxPlotData > this.widget.data || < BoxPlotData > {};
            $scope.statsValues = < any > {};
            $scope.statsScores = < any > {};
            $scope.statsTotal = < any > {};
            $scope.featureCount = < any > {};
            $scope.isNumber = (nr) => {
                return typeof nr === 'number';
            };
            $scope.adaptCustom = () => {
                this.unknownValues['Aangepast'] = this.selectedCriterion.unknownValue;
            };
            $scope.loadingSpinners = {
                mca: false
            };

            if (typeof $scope.data.layerId !== 'undefined') {
                // Hide widget
                this.parentWidget = $(`#${this.widget.elementId}-parent`);
                this.parentWidget.hide();
                this.mBusHandles.push(this.$messageBus.subscribe('layer', (action: string, layer: csComp.Services.ProjectLayer) => {
                    switch (action) {
                        case 'activated':
                        case 'deactivate':
                            this.activateLayer(layer);
                            break;
                        default:
                            break;
                    }
                }));

                this.mBusHandles.push(this.$messageBus.subscribe('mca', (action: string, mca: Mca.Models.Mca) => {
                    switch (action) {
                        case 'updated':
                        case 'deactivate':
                            this.handleMcaUpdateMessage(mca);
                            break;
                        default:
                            break;
                    }
                }));

                // Activate widget when layer is already loaded
                let l = this.$layerService.findLoadedLayer($scope.data.layerId);
                if (l) {
                    this.activateLayer(l);
                }
            }
        }

        public stop() {
            if (this.mBusHandles) {
                this.mBusHandles.forEach((mbh) => {
                    this.$messageBus.unsubscribe(mbh);
                });
                this.mBusHandles.length = 0;
            }
        }

        private toggleSpinner(key: string, enable: boolean) {
            this.$timeout(() => {
                this.$scope.loadingSpinners[key] = enable;
            }, 0, true);
        }

        private updateMca(forceUpdate: boolean = false) {
            if (forceUpdate || this.$scope.data.autoUpdate) {
                this.toggleSpinner('mca', true);
                this.$timeout(() => {
                    this.mcaScope.vm.updateMca();
                    this.mcaScope.vm.setStyle(null);
                    this.updateCharts();
                    this.toggleSpinner('mca', false);
                }, 100);
            }
        }

        private handleMcaUpdateMessage(mca ? : Mca.Models.Mca) {
            if (!this.selectedMca) return;
            if (mca && mca.id !== this.selectedMca.id) {
                this.selectedMca = mca;
                this.updateWidget();
            }
            this.updateCharts();
        }

        private updateWidget() {
            this.flatCriteria = this.getFlatCriteria(this.selectedMca);
            this.selectedCriterionIndex = Math.min(this.selectedCriterionIndex, this.flatCriteria.length - 1);
            this.selectedCriterion = this.flatCriteria[this.selectedCriterionIndex];
        }

        private updateCharts() {
            if (!this.flatCriteria || this.flatCriteria.length < this.selectedCriterionIndex) return;
            this.selectedCriterion = this.flatCriteria[this.selectedCriterionIndex];
            this.updateChart('boxplotcontainer1', 'value');
            this.updateChart('boxplotcontainer2', 'score');
            this.updateChart('boxplotcontainer3', 'total');
            this.disableIncompleteFeatures();
        }

        private updateChart(divId: string, type: string) {
            if (!divId) return;
            if (divId.charAt(0) !== '#') divId = '#'.concat(divId);
            if (!this.chartSvgs || !this.chartSvgs.hasOwnProperty(divId)) return;
            let mca = this.mcaScope.vm.mca;
            let data = this.getChartData(type);

            var min = Infinity,
                max = -Infinity;

            if (type === 'value') {
                min = this.$scope.statsValues.min;
                max = this.$scope.statsValues.max;
            } else if (type === 'score') {
                min = this.$scope.statsScores.min;
                max = this.$scope.statsScores.max;
            } else if (type === 'total') {
                min = this.$scope.statsTotal.min;
                max = this.$scope.statsTotal.max;
            }

            var axisPadding = 0.1 * (max - min);
            this.charts[divId].domain([min - axisPadding, max + axisPadding]);

            this.chartSvgs[divId]
                .datum(_.values(data[0]))
                .call(this.charts[divId].duration(1000));

            if (type === 'value') {
                this.chartSvgs[divId].selectAll('circle.outlier')
                    .on('click', (i, d) => {
                        if (d3.event.defaultPrevented) return; // click suppressed
                        this.selectFeatureFromIndicatorValue(i, d);
                    })
                    .on('mouseover', function (i, d) {
                        d3.select(this).style('cursor', 'pointer');
                    })
                    .on('mouseout', function (i, d) {
                        d3.select(this).style('cursor', 'default');
                    });
            } else if (type === 'total') {
                this.chartSvgs[divId].selectAll('circle.outlier')
                    .on('click', (i, d) => {
                        if (d3.event.defaultPrevented) return; // click suppressed
                        this.selectFeatureFromTotalScore(i, d);
                    })
                    .on('mouseover', function (i, d) {
                        d3.select(this).style('cursor', 'pointer');
                    })
                    .on('mouseout', function (i, d) {
                        d3.select(this).style('cursor', 'default');
                    });
            }
        }

        private getChartData(type: string): any[][] {
            let data = [
                []
            ];
            let rows = [];
            let mca = this.mcaScope.vm.mca;
            if (type === 'value') {
                mca.criteria.forEach((c: Criterion) => {
                    if (c.criteria && c.criteria.length > 0) {
                        c.criteria.forEach((subc) => {
                            rows.push(subc._propValues);
                        });
                    }
                });
                data = [rows[this.selectedCriterionIndex]];
                this.$scope.statsValues.min = _.min(data[0]);
                this.$scope.statsValues.max = _.max(data[0]);
                this.$scope.statsValues.avg = this.getAverage(_.values(data[0]));
                this.updateFeatureCount(_.size(data[0]));
            } else if (type === 'score') {
                mca.criteria.forEach((c: Criterion) => {
                    if (c.criteria && c.criteria.length > 0) {
                        c.criteria.forEach((subc) => {
                            if (subc.weight < 0) {
                                rows.push(this.getInverseScores(subc._scoreVals));
                            } else {
                                rows.push(subc._scoreVals);
                            }
                        });
                    }
                });
                data = [rows[this.selectedCriterionIndex]];
                this.$scope.statsScores.min = _.min(data[0]);
                this.$scope.statsScores.max = _.max(data[0]);
                this.$scope.statsScores.avg = this.getAverage(_.values(data[0]));
            } else if (type === 'total') {
                rows = this.mcaScope.vm.getFeatureScores(mca.label);
                data = [rows];
                this.$scope.statsTotal.min = _.min(rows);
                this.$scope.statsTotal.max = _.max(rows);
                this.$scope.statsTotal.avg = this.getAverage(rows);
            }
            return data;
        }

        private getFeaturesHavingLabel(label: string): {
            id: string,
            score: number
        }[] {
            let fts = [];
            this.mcaScope.vm.features.forEach((f) => {
                if (f.properties.hasOwnProperty(label) && typeof f.properties[label] === 'number') {
                    fts.push({
                        id: f.id,
                        score: f.properties[label]
                    });
                }
            });
            return _.sortBy(fts, 'score');
        }

        private getInverseScores(scores: Dictionary < any > ): Dictionary < any > {
            return _.map(scores, (val, key) => {
                return 1 - val;
            });
        }

        private createCharts() {
            this.selectedCriterion = this.flatCriteria[this.selectedCriterionIndex];
            this.createChart('boxplotcontainer1', 'Indicator waardes', 'value');
            this.createChart('boxplotcontainer2', 'Indicator scores', 'score');
            this.createChart('boxplotcontainer3', 'Totale MCA scores', 'total');
            this.disableIncompleteFeatures();
        }

        private createChart(divId: string, title: string, type: string) {
            if (!divId) return;
            if (divId.charAt(0) !== '#') divId = '#'.concat(divId);
            $(divId).empty();
            let mca = this.mcaScope.vm.mca;
            let data = this.getChartData(type);

            var min = Infinity,
                max = -Infinity;

            if (type === 'value') {
                min = this.$scope.statsValues.min;
                max = this.$scope.statsValues.max;
            } else if (type === 'score') {
                min = this.$scope.statsScores.min;
                max = this.$scope.statsScores.max;
            } else if (type === 'total') {
                min = this.$scope.statsTotal.min;
                max = this.$scope.statsTotal.max;
            }

            // console.log(JSON.stringify(data[0]));
            var margin = {
                top: 10,
                right: 40,
                bottom: 0,
                left: 40
            };
            let height = this.parentWidget.innerHeight() - 60;
            let width = Math.min(140, (this.parentWidget.innerWidth() - 40) / 4);

            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            this.charts[divId] = ( < any > d3).box()
                .whiskers(iqr(1.5))
                .width(width)
                .height(height)
                .title(title);

            var axisPadding = 0.1 * (max - min);
            this.charts[divId].domain([min - axisPadding, max + axisPadding]);

            var svg = d3.select(divId).selectAll('svg')
                .data([_.values(data[0])])
                .enter().append('svg')
                .attr('class', 'box')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.bottom + margin.top)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .call(this.charts[divId]);

            if (type === 'value') {
                svg.selectAll('circle.outlier')
                    .on('click', (i, d) => {
                        if (d3.event.defaultPrevented) return; // click suppressed
                        this.selectFeatureFromIndicatorValue(i, d);
                    })
                    .on('mouseover', function (i, d) {
                        d3.select(this).style('cursor', 'pointer');
                    })
                    .on('mouseout', function (i, d) {
                        d3.select(this).style('cursor', 'default');
                    });
            } else if (type === 'total') {
                svg.selectAll('circle.outlier')
                    .on('click', (i, d) => {
                        if (d3.event.defaultPrevented) return; // click suppressed
                        this.selectFeatureFromTotalScore(i, d);
                    })
                    .on('mouseover', function (i, d) {
                        d3.select(this).style('cursor', 'pointer');
                    })
                    .on('mouseout', function (i, d) {
                        d3.select(this).style('cursor', 'default');
                    });
            }

            this.chartSvgs[divId] = svg;

            // Returns a function to compute the interquartile range.
            function iqr(k) {
                return function (d: any, i: number) {
                    var q1 = d.quartiles[0],
                        q3 = d.quartiles[2],
                        iqr = (q3 - q1) * k,
                        i = -1,
                        j = d.length;
                    while (d[++i] < q1 - iqr);
                    while (d[--j] > q3 + iqr);
                    return [i, j];
                };
            }
        }

        private applyToAllIndicators() {
            let unknownValue = this.selectedCriterion.unknownValue;
            let dynamicBoundsValue = this.selectedCriterion.dynamicBoundsValue;
            this.applyUnknownValue(this.selectedMca.criteria, unknownValue);
            this.applyDynamicBoundsValue(this.selectedMca.criteria, dynamicBoundsValue);
            this.updateMca(true);
        }

        private applyUnknownValue(criteria: Criterion[], unknownValue) {
            criteria.forEach((crit) => {
                crit.unknownValue = unknownValue;
                if (crit.criteria && crit.criteria.length > 0) {
                    this.applyUnknownValue(crit.criteria, unknownValue);
                }
            });
        }

        private applyDynamicBoundsValue(criteria: Criterion[], dynamicBoundsValue) {
            criteria.forEach((crit) => {
                crit.dynamicBoundsValue = dynamicBoundsValue;
                if (crit.criteria && crit.criteria.length > 0) {
                    this.applyDynamicBoundsValue(crit.criteria, dynamicBoundsValue);
                }
            });
        }

        private selectFeatureFromIndicatorValue(index: number, data: any) {
            let valueAtIndex = _.values(this.selectedCriterion._propValues).sort()[index];
            let featureId = _.findKey(this.selectedCriterion._propValues, (val, key) => {
                return valueAtIndex === val;
            });
            let f = this.$layerService.findFeatureById(featureId);
            if (f) this.$layerService.selectFeature(f);
        }

        private selectFeatureFromTotalScore(index: number, data: any) {
            let mca = this.selectedMca;
            let c = 0;
            let idScoreObject = this.getFeaturesHavingLabel(mca.label)[index];
            let f = this.$layerService.findFeatureById(idScoreObject.id);
            if (f) this.$layerService.selectFeature(f);
        }

        private disableIncompleteFeatures() {
            let fts = this.mcaScope.vm.features;
            if (!fts) return;
            let mca = this.selectedMca;
            fts.forEach((f) => {
                if (!f.properties) return;
                let nrOfUnknowns: Dictionary < number > = {};
                mca.criteria.forEach(c => {
                    if (c.criteria && c.criteria.length > 0) {
                        nrOfUnknowns[c.title] = 0;
                        c.criteria.forEach((subc) => {
                            if (!f.properties.hasOwnProperty(subc.label) || typeof f.properties[subc.label] !== 'number') {
                                nrOfUnknowns[c.title] += 1;
                            }
                        });
                    }
                });
                nrOfUnknowns['mca'] = _.reduce(nrOfUnknowns, (memo: number, val: number) => {
                    return memo + val;
                }, 0);
                this.processIncompleteFeatures(nrOfUnknowns, f);
            });
            this.$layerService.updateLayerFeatures(fts[0].layer);
        }

        /** Grey out incomplete features, activate complete features */
        private processIncompleteFeatures(nrOfUnknowns: Dictionary < number > , f: IFeature) {
            let mca = this.selectedMca;
            let cc = this.criterionCompleteness;
            let isInvalid;
            Object.keys(nrOfUnknowns).forEach((critKey) => {
                let nrInvalidProperties = nrOfUnknowns[critKey];
                if (nrInvalidProperties / cc[critKey].criterionLength > (cc[critKey].maxUnknownPercentage)) {
                    isInvalid = true;
                }
            });
            let wasInvalid = f.properties[mca.label] === -1;
            if (isInvalid && !wasInvalid) {
                // If feature is now incomplete, but wasn't before:
                f.properties['_' + mca.label] = f.properties[mca.label];
                f.properties[mca.label] = -1;
            } else if (wasInvalid && !isInvalid) {
                // If feature was incomplete, but isn't anymore:
                f.properties[mca.label] = f.properties['_' + mca.label];
            }
        }

        private updateFeatureCount(numberOfValidItems: number) {
            this.$scope.featureCount.valid = numberOfValidItems || 0;
            this.$scope.featureCount.invalid = this.$scope.featureCount.total - this.$scope.featureCount.valid;
        }

        private activateLayer(layer: csComp.Services.ProjectLayer) {
            this.mcaScope = this.getMcaScope();
            if (!this.mcaScope) return;

            if (layer.id !== this.$scope.data.layerId || (layer.id === this.$scope.data.layerId && !layer.enabled)) {
                this.parentWidget.hide();
                return;
            }
            this.$timeout(() => {
                this.$scope.featureCount.total = this.mcaScope.vm.features.length;
                this.parentWidget.show();
                this.createCharts();
            }, 0);
        }

        private getFlatCriteria(mca: McaModel): Criterion[] {
            let result = [];
            this.criterionCompleteness = {};
            mca.criteria.forEach((c: Criterion) => {
                if (c.criteria && c.criteria.length > 0) {
                    c.criteria.forEach((subc) => {
                        result.push(subc);
                    });
                    this.criterionCompleteness[c.title] = {
                        maxUnknownPercentage: 1,
                        criterionLength: c.criteria.length
                    };
                }
            });
            this.criterionCompleteness['mca'] = {
                maxUnknownPercentage: 1,
                criterionLength: result.length
            };
            return result;
        }

        private getAverage(arr: number[]): number {
            return _.reduce(arr, (memo: number, num: number) => {
                return memo + num;
            }, 0) / (arr.length === 0 ? 1 : arr.length);
        }

        private getMcaScope() {
            var mcaElm = angular.element('div[id="mca"]');
            if (!mcaElm) {
                console.log('Mca element not found.');
                return;
            }
            var mcaScope = < Mca.IMcaScope > mcaElm.scope();
            if (!mcaScope) {
                console.log('Mca controller scope not found.');
                return;
            } else {
                this.$timeout(() => {
                    this.$scope.availableMcas = mcaScope.vm.availableMcas;
                    this.selectedMca = mcaScope.vm.mca;
                    this.updateWidget();
                }, 0);
            }
            return mcaScope;
        }
    }
}