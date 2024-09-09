import React from 'react';

export default class StepProgress extends React.Component {
  constructor() {
    super();
    // ooo" console.log('props:', this.props);
    this.state = {}
    this.stepBudget = {
      "tagBudget" : "",
      "numberBudget": 0
    }
  }
  componentDidMount () {
    this.state = this.props
    const stateComplete = this.state
    const voteState = stateComplete.state
    const stateProfress = stateComplete.completeState['presupuesto-estado']
    const budgetTotal = stateComplete['presupuesto-total']

    if (stateProfress == 'preparacion') {
      let bullet = document.querySelector('#preparacion')
      bullet.className += 'inProgress'
      // bullet = document.querySelector('#compra')
      // bullet.className += 'inProgress'

      // ooo" se compone el #stepBudget
      this.stepBudget.tagBudget="Presupuesto estimado"
      this.stepBudget.numberBudget = stateComplete.completeState['presupuesto-preparacion']

    } else     if (stateProfress == 'compra') {
      let bullet = document.querySelector('#preparacion')
      bullet.className += 'active'
      bullet = document.querySelector('#compra')
      bullet.className += 'inProgress'
      // bullet = document.querySelector('#ejecucion')
      // bullet.className += 'inProgress'

      // ooo" se compone el #stepBudget
      this.stepBudget.tagBudget="Presupuesto a ejecutar"
      this.stepBudget.numberBudget = stateComplete.completeState['presupuesto-compra']
      
    } else     if (stateProfress == 'ejecucion') {
      let bullet = document.querySelector('#preparacion')
      bullet.className += 'active'
      bullet = document.querySelector('#compra')
      bullet.className += 'active'
      bullet = document.querySelector('#ejecucion')
      bullet.className += ' inProgress'
      // bullet = document.querySelector('#finalizado')
      // bullet.className +=  'inProgress inFInalProgress'

      // ooo" se compone el #stepBudget
      this.stepBudget.tagBudget="Presupuesto en ejecución"
      this.stepBudget.numberBudget = stateComplete.completeState['presupuesto-ejecucion']
    } else     if (stateProfress == 'finalizado') {

      let bullet = document.querySelector('#preparacion')
      bullet.className += 'active'
      bullet = document.querySelector('#compra')
      bullet.className += 'active'
      bullet = document.querySelector('#ejecucion')
      bullet.className += ' active'
      bullet = document.querySelector('#finalizado')
      bullet.className += '   active'

      // ooo" se compone el #stepBudget
      this.stepBudget.tagBudget="Presupuesto ejecutado"
      this.stepBudget.numberBudget = stateComplete.completeState['presupuesto-finalizado']
    }else{
      console.log('::: don´t mount component for step progress :::',)

    }
  }
  render() {
    // ooo" console.log('props:', this.props);
    
    const stateComplete = this.props.completeState
    const voteState = stateComplete.state
    const stateProfress = stateComplete['presupuesto-estado']
    const budgetTotal = stateComplete['presupuesto-total']
    const totalVote = stateComplete['proyecto-votos']

    return (
      <div >
            <div id='titulo-desk' className=' title-progress'>Seguimiento / Estado de proyecto</div>
            <div className='contenedor-progress'>
              <div className='contenedor-etapas'>
                <div className='flex-col'>
                  <p className='subtitle-progress'><b>ETAPAS</b></p>
                  <div className=' responsive-bullet-div'>
                      {/* ooo" steps bullet  */}
                     <div className='step-progressbar bullets'>
                      <div className='bullet-div'>
                        <p className='step-text'>Preparación</p>
                        <div id="preparacion" className='step bullet-wrapper '>
                            <div className='bullet'></div>
                            {/* <p id='titulo-res' className='step-text'>Preparación</p> */}

                        </div>
                      </div>
                      <div className='bullet-div'>
                        <p className='step-text'>En contratación</p>
                        <div id="compra" className='step bullet-wrapper '>
                            <div className='bullet'></div>
                        </div>
                      </div>
                      <div className='bullet-div'>
                        <p className='step-text'>Ejecución</p>
                        <div id="ejecucion" className='step bullet-wrapper '>
                            <div className='bullet'></div>
                        </div>
                      </div>
                      <div className='bullet-div'>
                        <p className='step-text'>Finalizado</p>
                        <div id="finalizado" className='step bullet-wrapper '>
                            <div id='finalBullet' className='bullet'></div>
                        </div>
                      </div>
                  </div>
                  {/* ooo" for responsive */}
                  <div className='responsive-tag-steps'>
                    <p className='step-text'>Preparación</p>
                    <p className='step-text'>En contratación</p>
                    <p className='step-text'>Ejecución</p>
                    <p className='step-text'>Finalizado</p>
                  </div>
                  </div>
                  {/* ooo" name for varible {budgetTitle} */}
                  <p id='stepBudget'><b>{this.stepBudget.tagBudget}:</b> $ {this.stepBudget.numberBudget}</p>
                </div>
                <div className='contenedor-votos'>
                  <div className='flex-item'>
                    <p ><b>VOTOS</b></p>
                  </div>
                  <div className='flex-item'>
                    <p className='numero-votos'>{totalVote}</p>  
                  </div>
                </div>
              </div>
              {
                stateComplete['presupuesto-historial'] && stateComplete['presupuesto-historial'].length > 0 &&
                <div className='contenedor-historial'>
                  <h4>Historial</h4>
                  <p>{stateComplete['presupuesto-historial']}</p>
                </div>
              }
        </div>
      </div>
    );
  }
}