import React,{Component} from 'react'
import {Link} from 'react-router'

export default class Jump extends Component {
	constructor(props) {
		super(props) 
		this.state={visibility:false}
		this.limit=370
	}
	componentWillMount(){
		window.addEventListener('scroll', this.checkScroll) 
		
	}
	componentWillUnmount(){
		window.removeEventListener('scroll', this.checkScroll) 
	}
	checkScroll = (event) => {
		if (window.matchMedia("(min-width: 975px)").matches && document.body.scrollTop>this.limit){
			this.setState({visibility:true})
		}else{
			this.setState({visibility:false})
		}
	}
	render () {
		return (
			<div className='jump-container'>
				{ this.state.visibility && (
					<div className='boton-jump' tabIndex="200" onClick={this.props.goTop}>
					</div>
				)}
			</div>
		)
	}
}


