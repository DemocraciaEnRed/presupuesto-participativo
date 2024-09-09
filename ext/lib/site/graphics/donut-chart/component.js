import React,{Component} from 'react'
import {Doughnut} from 'react-chartjs-2';

export default class DonutChart extends Component {
    constructor(props){
        super(props);
        this.state = {
            yearSelected: Object.keys(this.props.data)[0],
            index: 0
        };
    }

    updateStateData(index) {
        this.setState({
            yearSelected: Object.keys(this.props.data)[index],
            index: index
        });
    }

    handleYearChange(e) {
        this.setState({
            yearSelected: Object.keys(this.props.data)[e.target.value],
            index: e.target.value
        });
    }

    handleLeftClick() {
        let newIndex = this.state.index - 1;
        if(!Object.keys(this.props.data)[newIndex]){
           newIndex = Object.keys(this.props.data).length - 1;
        } 
        this.updateStateData(newIndex)
    }

    handleRightClick() {
        let newIndex = Number(this.state.index) + 1;
        if(!Object.keys(this.props.data)[newIndex]){
           newIndex = 0;
        } 
        this.updateStateData(newIndex)
    }

	render () {
        // Temporary workaround for this issue:
        // https://github.com/jerairrest/react-chartjs-2/issues/250
        const chartData = JSON.parse(JSON.stringify(this.props.data));
        
        const chartWidth = window.matchMedia('(min-width: 550px)').matches ? 550 : 360;
        const chartHeight = window.matchMedia('(min-width: 550px)').matches ? 450 : 360;
        const legendOptions = {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                padding: 15,
                fontSize: 12,
                fontColor: '#4d4d4d',
                fontStyle: 'bold'
            }
        };

        const chartOptions = {
            defaultFontFamily: "'Open Sans', 'Arial', sans-serif",
            responsive: false, 
            cutoutPercentage: 65,
            tooltips: {
                xPadding: 10,
                yPadding: 10,
                caretSize: 8,
                bodyFontStyle: 'bold'
            }
        };

		return (
            <div className="donut-chart-wrapper">
                <h3>{this.props.title}</h3>
                <div className="chart-controls">
                    <div className="button-toggle-chart button-toggle-chart__left" onClick={this.handleLeftClick.bind(this)}>
                        <div className="button-toggle-chart__icon">
                            <svg viewBox="0 0 512 512" height="15" width="15"><path fill="#464646" d="m198 217l20-19 0 0 96-96 38 39-77 77 0 0-38 38 19 19 0 0 96 96-38 39-77-77 0 0-39-39-38-38z"></path></svg>
                        </div>
                    </div>
                    <div className="select-toggle-chart__wrapper">
                        <div className="select-toggle-chart__icon">
                            <svg viewBox="0 0 512 512" height="15" width="15"><path fill="#464646" d="m217 314l-19-20 0 0-96-96 39-38 77 77 0 0 38 38 19-19 0 0 96-96 39 38-77 77 0 0-39 39-38 38z"></path></svg>
                        </div>
                        <select className="select-toggle-chart" value={this.state.index} onChange={this.handleYearChange.bind(this)}>
                            {Object.keys(this.props.data).map((key, index) => {
                                return <option key={key} value={index}>{key}</option>;
                            })}
                        </select>
                    </div>
                    <div className="button-toggle-chart button-toggle-chart__right" onClick={this.handleRightClick.bind(this)}>
                        <div className="button-toggle-chart__icon">
                            <svg viewBox="0 0 512 512" height="15" width="15"><path fill="#464646" d="m314 295l-20 19 0 0-96 96-38-39 77-77 0 0 38-38-19-19 0 0-96-96 38-39 77 77 0 0 39 39 38 38z"></path></svg>                    
                        </div>
                    </div>
                </div>
                <Doughnut ref={(reference) => this.chartReference = reference} width={chartWidth} height={chartHeight} 
                options={chartOptions} legend={legendOptions}
                data={chartData[this.state.yearSelected]} />
            </div>
		)
	}
}