import React, { Component } from 'react'
import { Line } from 'react-chartjs-2';
import config from 'lib/config';

const data = {
    labels: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
    datasets: [
        {
            data: [1178, 6691, 10068, 18880, 26537, 45010, 69201, 78310],
            borderColor: '#7cbb42',
            backgroundColor: '#ffffff',
            pointBackgroundColor:  '#7cbb42',
            fill: false
        },
    ],
};

export default class LineChart extends Component {
    componentWillMount () {
      // custom showAllTooltips: https://stackoverflow.com/questions/36992922/chart-js-v2-how-to-make-tooltips-always-appear-on-pie-chart
      Chart.pluginService.register({
        beforeRender: function (chart) {
          if (chart.config.options.showAllTooltips) {
              // create an array of tooltips
              // we can't use the chart tooltip because there is only one tooltip per chart
              chart.pluginTooltips = [];
              chart.config.data.datasets.forEach(function (dataset, i) {
                  chart.getDatasetMeta(i).data.forEach(function (sector, j) {
                      chart.pluginTooltips.push(new Chart.Tooltip({
                          _chart: chart.chart,
                          _chartInstance: chart,
                          _data: chart.data,
                          _options: chart.options.tooltips,
                          _active: [sector]
                      }, chart));
                  });
              });

              // turn off normal tooltips
              chart.options.tooltips.enabled = false;
          }
      },
        afterDraw: function (chart, easing) {
          if (chart.config.options.showAllTooltips) {
              // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
              if (!chart.allTooltipsOnce) {
                  if (easing !== 1)
                      return;
                  chart.allTooltipsOnce = true;
              }

              // turn on tooltips
              chart.options.tooltips.enabled = true;
              Chart.helpers.each(chart.pluginTooltips, function (tooltip) {
                  tooltip.initialize();
                  tooltip.update();
                  // we don't actually need this since we are not animating tooltips
                  tooltip.pivot();
                  tooltip.transition(easing).draw();
              });
              chart.options.tooltips.enabled = false;
          }
        }
      });
    }

    render() {
        const legendOptions = {
            display: false
        };
        let chartOptions = {
            defaultFontFamily: "'Open Sans', 'Arial', sans-serif",
            tooltips: {
                xPadding: 10,
                yPadding: 10,
                caretSize: 8,
                displayColors: false,
                titleFontSize: 0,
                bodyFontSize: 16,
                backgroundColor: 'transparent',
                bodyFontColor: '#882982',
                intersect: false,
                mode: 'index',
                callbacks: {
                  label: function (tooltipItem, data) {
                    var label = tooltipItem.yLabel.toString() || '';
                    if (label){
                      label = label.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    }
                    return label;
                  }
                }
            },
            scales: {
                // styling an axis: https://www.chartjs.org/docs/latest/axes/styling.html
                xAxes: [{
                    ticks: {
                        display: true,
                        fontColor: '#000',
                        fontSize: 14
                    },
                    gridLines: {
                        display: true,
                        drawOnChartArea: false,
                        drawTicks: true
                    }
                }],
                yAxes: [{
                    gridLines: {
                        display: true,
                        drawOnChartArea: false,
                        drawTicks: true
                    } ,
                    ticks: {
                        display: true,
                        fontColor: '#000',
                        min: 0
                    },
                }]
            }
        };

        // Código para ayudar a crear la imagen del gráfico de la home.
        // Solo habilitar en local! Descargar la imagen (con el link) y editarla un poco
        // moviendo a su lugar los textos donde se quiera y agrandando el último
        let dev_enableSaveForHome = false
        if (config.env === "development" && dev_enableSaveForHome){
          // custom option, definida en constructor
          chartOptions.showAllTooltips = true

          chartOptions.elements = { line: { tension: 0 } }

          chartOptions.tooltips.yPadding = 55

          // styling an axis: https://www.chartjs.org/docs/latest/axes/styling.html
          chartOptions.scales.xAxes[0].gridLines =
          chartOptions.scales.yAxes[0].gridLines = {
              display: true,
              drawOnChartArea: false,
              drawTicks: true,
              color: 'black',
              lineWidth: 3,
              zeroLineColor: 'black',
              zeroLineWidth: 3
          }
          chartOptions.scales.xAxes[0].ticks.fontStyle = 'bold'
          chartOptions.scales.yAxes[0].ticks.display = false

          // save chartjs to image: https://stackoverflow.com/questions/20206038/converting-chart-js-canvas-chart-to-image-using-todataurl-results-in-blank-im
          chartOptions.animation = {
            onComplete: function(){
              var url_base64 = document.getElementById('myLineChart').toDataURL('image/png');
              document.getElementById('downloadLink').href = url_base64;
            }
          }
        }

        return (
            <div>
                <Line id='myLineChart' data={data} legend={legendOptions} options={chartOptions}/>
                {dev_enableSaveForHome && <a id='downloadLink' download='filename.png'>Save as Image</a>}
            </div>
        );
    }
};
