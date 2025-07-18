import { Component } from '/tbc/core/components/component.js';
import { sum } from '/tbc/core/utils.js';
import { actionColors } from './color_settings.js';
export class SourceChart extends Component {
    constructor(parentElem, allActionMetrics) {
        const chartCanvas = document.createElement("canvas");
        super(parentElem, 'source-chart-root', chartCanvas);
        chartCanvas.style.height = '400px';
        chartCanvas.style.width = '600px';
        chartCanvas.height = 400;
        chartCanvas.width = 600;
        const actionMetrics = allActionMetrics
            .filter(actionMetric => actionMetric.damage > 0)
            .sort((a, b) => b.damage - a.damage);
        const names = actionMetrics.map(am => am.name);
        const totalDmg = sum(actionMetrics.map(actionMetric => actionMetric.damage));
        const vals = actionMetrics.map(actionMetric => actionMetric.damage / totalDmg);
        const bgColors = actionColors.slice(0, actionMetrics.length);
        const ctx = chartCanvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: names,
                datasets: [{
                        data: vals,
                        backgroundColor: bgColors,
                    }],
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                    }
                },
            },
        });
    }
}
