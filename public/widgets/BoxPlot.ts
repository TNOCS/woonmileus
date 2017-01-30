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
        featureCount: {
            valid: number,
            invalid: number,
            total: number;
        };
    }

    export interface BoxPlotData {
        layerId: string;
        title: string;
        hideTitle: boolean;
        canMinimize: boolean;
    }

    export class BoxPlotCtrl {
        private mcaScope: Mca.IMcaScope;
        private widget: csComp.Services.IWidget;
        private parentWidget: JQuery;
        private parentWidgetId: string;
        private mBusHandles: csComp.Services.MessageBusHandle[] = [];
        private unknownValues: Dictionary < 'zero' | 'half' | 'average' > = {
            'Nul (0)': 'zero',
            'Half (0.5)': 'half',
            'Gemiddelde': 'average'
        };
        private boundsValues: Dictionary < 'none' | 'iqr' | '1.5_iqr' > = {
            'Geen (min/max van data)': 'none',
            'Interkwartiel bereik': 'iqr',
            '1.5 x interkwartiel bereik': '1.5_iqr'
        };
        private selectedMca: McaModel;
        private selectedCriterionIndex: number = 0;
        private selectedCriterion: Criterion;
        private flatCriteria: Criterion[] = [];

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
            $scope.featureCount = < any > {};

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

        private updateMca() {
            this.mcaScope.vm.updateMca();
            this.createCharts();
        }

        private createCharts() {
            this.selectedCriterion = this.flatCriteria[this.selectedCriterionIndex];
            this.createChart('boxplotcontainer1', 'value');
            this.createChart('boxplotcontainer2', 'score');
        }

        private createChart(divId: string, type: string) {
            if (!divId) return;
            if (divId.charAt(0) !== '#') divId = '#'.concat(divId);
            $(divId).empty();
            let rows = [];
            let mca = this.mcaScope.vm.mca;
            let data = [
                []
            ];

            var min = Infinity,
                max = -Infinity;

            if (type === 'value') {
                mca.criteria.forEach((c: Criterion) => {
                    if (c.criteria && c.criteria.length > 0) {
                        c.criteria.forEach((subc) => {
                            rows.push(subc._propValues);
                        });
                    }
                });
                data = [rows[this.selectedCriterionIndex]];
                min = this.$scope.statsValues.min = _.min(data[0]);
                max = this.$scope.statsValues.max = _.max(data[0]);
                this.$scope.statsValues.avg = this.getAverage(data[0]);
                this.updateFeatureCount(data[0].length);
            } else if (type === 'score') {
                mca.criteria.forEach((c: Criterion) => {
                    if (c.criteria && c.criteria.length > 0) {
                        c.criteria.forEach((subc) => {
                            rows.push(_.values(subc._scoreVals));
                        });
                    }
                });
                data = [rows[this.selectedCriterionIndex]];
                min = this.$scope.statsScores.min = _.min(data[0]);
                max = this.$scope.statsScores.max = _.max(data[0]);
                this.$scope.statsScores.avg = this.getAverage(data[0]);
            }
            // console.log(JSON.stringify(data[0]));

            let height = this.parentWidget.innerHeight() - 60;
            let width = Math.min(160, this.parentWidget.innerWidth() / 2);

            var margin = {
                top: 0,
                right: 40,
                bottom: 10,
                left: 40
            };
            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            var chart = ( < any > d3).box()
                .whiskers(iqr(1.5))
                .width(width)
                .height(height);

            var axisPadding = 0.1 * (max - min);
            chart.domain([min - axisPadding, max + axisPadding]);

            var svg = d3.select(divId).selectAll('svg')
                .data(data)
                .enter().append('svg')
                .attr('class', 'box')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.bottom + margin.top)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .call(chart);

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
            mca.criteria.forEach((c: Criterion) => {
                if (c.criteria && c.criteria.length > 0) {
                    c.criteria.forEach((subc) => {
                        result.push(subc);
                    });
                }
            });
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
                    this.flatCriteria = this.getFlatCriteria(this.selectedMca);
                    this.selectedCriterion = this.flatCriteria[this.selectedCriterionIndex];
                }, 0);
            }
            return mcaScope;
        }
    }
}