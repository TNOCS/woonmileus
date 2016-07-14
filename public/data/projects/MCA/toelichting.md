<div style="height:20px"></div>

# Toelichting model ‘woonmilieus’ 
([Download als PDF](data\projects/MCA/Woonmilieus_op_de_kaart_toelichting3b.pdf))

Het model ‘zelfredzaamheidondersteunende woonmilieus’ geeft informatie over de geschiktheid van de woonomgeving voor senioren met functioneringsbeperkingen. De woonmilieus worden getoond op de kaartlaag ‘buurten’. Deze kaartlaag toont de Nederlandse buurten volgens de CBS-indeling. Nederland heeft ca. 12.000 buurten. Naast de kaartlaag ’buurten’ is er ook een kaartlaag ‘wijken’. Die toont eveneens de woonmilieus maar dan op wijkniveau volgens de CBS-indeling (ca. 2.750 wijken). Een wijk is meestal opgebouwd uit meerdere buurten.

Zelfredzaamheidondersteunende woonmilieus bestaan uit meerdere onderdelen of domeinen. In dit geval zijn 3 domeinen met 17 indicatoren gebruikt. De domeinen zijn afstand tot voorzieningen, sociale context en bewegingsvriendelijke omgeving. De bijbehorende indicatoren zijn in de onderstaande tabel opgesomd. Per gebied zijn alle indicatoren samengevoegd tot één totaalscore voor het woonmilieu middels een **multicriteria-analyse** (MCA). Zowel deze totaalscore van de MCA als de scores van de 17 indicatoren worden per gebied weergegeven op de kaart. In figuur 1 is de MCA-indicatorenset weergegeven.

*Domein 1: Nabijheid en bereikbaarheid van voorzieningen*
Onder dit domein vallen de 12 indicatoren die informatie geven over de mate waarin de woonomgeving beschikt over voor senioren relevante voorzieningen. De indicatoren zijn onder te brengen in 3 categorieën, namelijk:

1.	afstand tot voorzieningen;
2.	OV- routes;
3.	beschikbare FTE’s in de huisartsenzorg.

Hoe gunstiger de indicatoren des te hoger de domein- en totaalscore zullen zijn. Let op, gunstiger betekent niet altijd hoe hoger de score hoe beter. Bij afstand tot voorzieningen geldt bijvoorbeeld hoe korter de afstand hoe gunstiger (zie hieronder bij ‘Nadere toelichting MCA).

*Domein 2: Sociale context*
Onder dit domein vallen 4 indicatoren die informatie geven over de mate waarin de sociale woonomgeving kan bijdragen aan de zelfredzaamheid van senioren. De indicatoren zijn: 

1.	diversiteit woningvoorraad;
2.	diversiteit bevolkingsopbouw (wie wonen er);
3.	veiligheid;
4.	beschikbaarheid mantelzorg.

De indicatoren gaan dus over de sociale situatie in de buurt of wijk, over de buurtveiligheid en de informele zorg. Dat laatste gaat vooral over de aanwezigheid en inzet van mantelzorgers. De zelfredzaamheid van senioren is in een woonomgeving met sterke sociale banden en de beschikbaarheid van informele zorg uiteraard hoger.
Hoe gunstiger de indicatoren des te hoger de domein- en totaalscore zal zijn. 

*Domein 3: Beweegvriendelijke omgeving*
Onder dit domein valt de indicator die informatie geven over de kwaliteit van de fysieke woonomgeving. Een uitnodigende en toegankelijke omgeving stimuleert de fysieke activiteit van senioren. Dergelijke omgevingen houden hun fysieke gezondheid en zelfredzaamheid beter op peil. Daarnaast kan een dergelijke omgeving ook uitnodigen tot ontmoetingen met buurtgenoten wat een positief effect heeft op de sociale woonomgeving. Voor deze samengestelde indicator is gebruik gemaakt van de leefbaarometer.

Op basis van literatuurstudie is vastgesteld dat de bovengenoemde 3 domeinen uit de woonomgeving van invloed zijn op de zelfredzaamheid van mensen met functioneringsbeperkingen.

## Functioneringsprofielen 1 t/m 4 (en 5)
Bewoners met verschillende functioneringsbeperkingen stellen verschillende eisen aan hun woning en woonomgeving. Daarom zijn de bewoners in functioneringsprofielen ingedeeld.
TNO heeft in kaart gebracht hoe 65-plussers van nu functioneren. Dit heeft geleid tot vijf evidence-based functioneringsprofielen. Voor elk van de profielen is berekend welke kans mensen hebben op problemen met mobiliteit, zelfzorg, cognitie en overige noden. Ook is de omvang berekend van nu  en de verdere verwachting vanaf heden tot 2040.

De 5 profielen zijn:

- profiel 1, deze groep heeft relatief weinig problemen;
- profiel 2, deze groep heeft mobiliteitsproblemen. Ca. 50% heeft moeite met traplopen; 
- profiel 3, deze groep heeft mobiliteitsproblemen. Meer dan 90% heeft moeite met traplopen en problemen in de zelfzorg;
- profiel 4 en 5, deze groep heeft respectievelijk ernstige fysieke problemen en ernstige dementie. Deze groep heeft zorg nodig op het niveau van zware intramurale zorg.

Voor de mensen met verschillende functioneringsprofielen wegen de domeinen in verschillende verhoudingen mee. Dus is er voor elk functioneringsprofiel een aparte weging voor de MCA ingesteld. De wegingen zijn vastgesteld op basis van literatuurstudie en expertsessies. In figuur 2 is de specifieke weging per functioneringsprofiel weergegeven.

## Databewerking
Het grootste gedeelte van de gebruikte data is na opschoning niet verder bewerkt. Opschoning betrof vooral het identificeren en wegwerken van missing values en outliers. Databewerking heeft alleen plaats gevonden bij:

1.	mantelzorgratio. Berekend als het aantal uren mantelzorg dat verleend wordt in een gemeente per oudere met 1 of meer langdurige beperkingen;
2.	relatieve positie van gemeente ten aanzien van de mantelzorgratio. Berekend als de ranking van een gemeente ten opzichte van andere gemeenten. Een hogere ratio is beter;
3.	relatieve positie van gemeente ten aanzien van de afstemming van vraag en aanbod huisartsen. Een kleinere gekwadrateerde afwijking van het landelijk gemiddelde is beter;
4.	aantal bushaltes per wijk. GIS-analyse om de aantallen per wijk vast te stellen;
5.	aantal busroutes per wijk. GIS-analyse om de aantallen per wijk vast te stellen;
6.	gemiddeld aantal routes per halte per wijk. GIS-analyse om de gemiddelde aantallen per halte vast te stellen;
7.	aantal bushaltes per buurt. GIS-analyse om de aantallen per buurt vast te stellen;
8.	aantal busroutes per buurt. GIS-analyse om de aantallen per buurt vast te stellen;
9.	gemiddeld aantal routes per halte per buurt. GIS-analyse om de gemiddelde aantallen per halte vast te stellen.

Een ander punt dat aandacht verdient, is het gebruik van leefbaarometerscores als operationalisering. Leefbaarometerscores zijn samengestelde scores die bestaan uit een gecombineerde score op een aantal indicatoren. Vanwege het feit dat deze samengestelde scores gevalideerd zijn door de (statistische) methodiek die aan de Leefbaarometer ten grondslag ligt, is besloten om er hier gebruik van te maken.

## Nadere toelichting multicriteria-analyse (MCA)
Zoals eerder genoemd wordt gebruik gemaakt van een MCA om te komen tot één totaalscore voor de woonmilieus per functioneringsprofiel, zowel op buurt- als op wijkniveau. De samenvoeging van de diverse indicatoren wordt op de volgende meetkundige manier bereikt: 

1.	elke indicator herschalen naar een bereik tussen de 0 (minimale waarde in de buurten of wijken van de geselecteerde gemeente) en 1 (maximale waarde in de buurten of wijken van de geselecteerde gemeente);
2.	elke indicator een weging geven van -1 tot -3 of van +1 tot +3 ten opzichte van de andere indicatoren. Een gewicht minder dan 0 veroorzaakt een negatief effect, een waarde groter dan 0 veroorzaakt een positief effect (bij afstand tot voorzieningen geldt bijvoorbeeld hoe kleiner de afstand hoe beter, daarom is hier een weging minder dan 0 toegekend). Bij waarde 0 wordt de indicator genegeerd.

Cruciaal voor een succesvolle toepassing van de MCA is het toekennen van de juiste prioritering aan de verschillende indicatoren. De in figuren 1 en 2 voorgestelde weging vormt de standaardinstelling voor de MCA’s. Die prioritering is bepaald op basis van een literatuurstudie naar de effecten van de indicatoren op de zelfredzaamheid van senioren en een aantal (interne) expertsessies. Een overzicht van bronnen die gebruikt zijn voor het bepalen van het effect, is te vinden in de literatuurlijst. 

Zoals eerder opgemerkt bestaat de MCA feitelijk uit 8 aparte MCA’s (4 MCA’s op buurtniveau, één per profiel plus 4 MCA’s op wijkniveau, ook één per profiel), omdat bewoners met verschillende functioneringsbeperkingen verschillende eisen aan hun woning en woonomgeving stellen. Door  aangepaste wegingen per functioneringsprofiel te hanteren houdt het model rekening met de veranderende mobiliteitsbeperkingen van senioren (op buurt- en wijkniveau).

De gebruiker heeft daarnaast de mogelijkheid de wegingen binnen de MCA naar eigen inzicht aan te passen. De vooraf ingestelde effecten benaderen de gemiddelde effecten van indicatoren op zelfredzaamheid, zoals die in andere onderzoeken zijn vastgesteld (zie literatuurlijst). Als een gebruiker echter gegronde argumenten heeft om aan te nemen dat de interactie tussen een individuele oudere of een bepaalde groep senioren en de omgeving anders is, kan de gebruiker de MCA-tool naar eigen inzicht en kennis instellen. 

## Literatuurlijst
Beard, J. R. , S. Blaney, M. Cerda, V. Frye, G.S. Lovasi, D. Ompad, A. Rundle & D. Vlahov (2009), Neighborhood characteristics and disability in older adults. Journal of Gerontology: Social Sciences. DOI: 10.1093/geronb/gbn018. Consulted: 2-11-2015.

Clarke, P. J.A. Ailshire, M. Bader, J.D. Morenoff & J. S. House (2008), Mobility disability and the urban built environment. American Journal of Epidemiology 168, pp. 506-513. 

Clarke, P., J. A. Ailshire & P. Lantz (2009), Urban built environments and trajectories of mobility disability: Findings from a national sample of community-dwelling American adults (1986–2001). Social Science & Medicine 69(6), pp. 964-970.

Clare, P & L.K. George (2005), The role of the built environment in the disablement process. American Journal of Public Health 95(11), pp. 1933-1939.

Doekhie, K.D.,  A.J.E. de Veer, J.J.D.J.M. Rademakers, F.G. Schellevis, A.L. Francke (2014), Ouderen van de toekomst. Verschillen in de wensen en mogelijkheden voor wonen, welzijn en zorg. Utrecht: NIVEL.	

Etman, A., C.B.M. Kamphuis, R.G. Prins, A. Burdorf, F.H. Pierik & F.J. van Lenthe. Characteristics of residential areas and transportational walking among frail and non-frail Dutch elderly: does the size of the area matter? International Journal of Health Geographics 13(7).
http://www.ij-healthgeographics.com/content/13/1/7. Consulted: 2-11-2015. 

Fisher, K.J., F. Li, Y. Michael & M. Cleveland (2004), Neighborhood-level influences on physical activity among older adults: a multilevel analysis. Journal of Aging and Physical Activity 12(01), pp. 45-63.

Freedman, V.A., I.B. Grafova,  R. F. Schoen,  J.Rogowski (2008), Neighborhoods and disability in later life. Social Science & Medicine 66(11), pp. 2253-2267. 

Galenkamp, H., I. Plaisier, M. Huisman, A.W. Braam, D.J.H. Deeg (2012), Trends in gezondheid en het belang van zelfredzaamheid bij zelfstandig wonende ouderen. Advies Raad voor de Volksgezondheid & Zorg. Amsterdam: Vrije Universiteit Amsterdam/ VU Medisch Centrum.

King, D. (2008), Neighborhood and individual factors in activity in older adults: results from the neighborhood and senior health study. Journal of Aging and Physical Activity 16(2), pp. 144-170.

Kerr, J., D. Rosenberg & L. Frank (2012), The Role of the Built Environment in Healthy Aging Community Design, Physical Activity, and Health among Older Adults 27(1), pp. 43-60.

Lawton, M.(1982), Competence, environmental press, and the adaptation of older people. In: M. Lawton, P. Windley & T. Byerts (Eds.), Ageing and the environment: Theoretical approaches, pp. 33-59. New York: Springer.

Lee, I.M., R. Ewing &d H. D. Sesso (2009), The built environment and physical activity levels. The Harvard alumni health study. American Journal of Preventive Medicine 37 (4), pp. 293-298.

Li, F., K. J. Fisher, R. C. Brownson & M. Bosworth, Multilevel modelling of built environment characteristics related to neighbourhood walking activity in older adults. Journal of Epidemiology and Community Healt 59(7), pp. 558-564. 

Mendes de Leon, C. F., K. A. Cagney, J. L. Bienias, L. L. Barnes, K.A. Skarupski, P. A. Scherr, & D. A. Evans (2009), Neighborhood social cohesion and disorder in relation to walking in community-dwelling older adults: a multilevel analysis. Journal of Aging & Health 21, pp. 155-71.

Rejeski, W.J., M. E. Miller, A.C. King, S.A. Studenski, J.A. Katula, R.A. Fielding, N.W. Glynn, M.P. Walkup, J.A. Ashmore & For the LIFE Investigators (2007), Predictors of adherence to physical activity in the Lifestyle Interventions and Independence for Elders pilot study (LIFE-P). Clinical Interventions in Aging 2 (3), pp. 485-494. 

Rosso, A.L.,  A. H. Auchincloss & Y. L. Michael (2011), The urban built environment and mobility in older adults: A comprehensive review. Journal of Aging Research. DOI: 10.4061/2011/816106. Consulted: 2-11-2015.

Satariano, W.A., S. L. Ivey, E. Kurtovich, M. Kealey, A.E. Hubbard, C.M. Bayles, L.L. Bryant, R.H. Hunter, T.R. Prohaska (2010), Lower-body function, neighborhoods, and walking in an older population. American Journal of Preventive Medicine 38(4), pp. 419-428.

Schwanen, T., D. Banister, A. Bowling, 2012, Independence and mobility in later life. Geoforum 43(6), pp. 1313-1322. DOI: 10.1016/j.geoforum.2012.04.001.

*Disclaimer*
TNO kan geen verantwoordelijkheid nemen voor de juistheid van de gegevens in de genoemde bronbestanden van het CBS Nabijheidsstatistiek (2014), de Leefbaarometer (2014) en het VAAM (2013).
Uiteraard is het wenselijk om voor elke indicator de meest recente informatie weer te geven met gelijke peildatum. Er is gewerkt met verschillende bronnen, die helaas niet op hetzelfde moment worden geactualiseerd. Het lijkt op dit moment echter wel het best beschikbare.
Doordat ook de geografische grenzen van buurten, wijken en gemeenten door de loop van de jaren veranderen, is het niet altijd mogelijk om de informatie in de betreffende gebieden weer te geven.
Zoals eerder gezegd is het voor een succesvolle toepassing van de MCA cruciaal de juiste prioritering aan de verschillende indicatoren toe te kennen. Die prioritering is zorgvuldig bepaald op basis van een literatuurstudie (zie literatuurlijst) en een aantal (interne) expertsessies. Als een gebruiker echter gegronde argumenten heeft om aan te nemen dat de interactie tussen een individuele oudere of een bepaalde groep senioren en de omgeving anders is, kan de gebruiker de MCA-tool naar eigen inzicht en kennis instellen.
