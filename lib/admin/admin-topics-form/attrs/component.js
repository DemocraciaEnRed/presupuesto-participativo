import React, { Component } from 'react'

export default class extends Component {
  constructor (props) {
    super(props)

    this.state = {
      groupedAttrs: [],
      allAttrs: []
    }

    this.handleChange = this.handleChange.bind(this)
    this.changeFields = this.changeFields.bind(this)
  }

  componentWillMount() {
    const {forum, topic} = this.props
    let groupedAttrs = [];

    // Load groups
    forum.topicsAttrs.forEach(topicAttr => {
      let attrGroup = groupedAttrs.find(groupEle => groupEle.name == topicAttr.group)
      if (!attrGroup){
        attrGroup = {
          name: topicAttr.group || '',
          order: topicAttr.groupOrder || 0,
          attrs: [],
          react: []
        }
        attrGroup.name && attrGroup.react.push(<h5 className="subtitle col-md-12">{attrGroup.name}</h5>)
        groupedAttrs.push(attrGroup)
      }
      attrGroup.attrs.push(topicAttr)
    })

    // Sort groups and attrs in groups
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    groupedAttrs.sort(function(gA, gB) {
      return gA.order - gB.order;
    });

    groupedAttrs.forEach(group => {
      group.attrs.sort(function(aA, aB) {
        return aA.order - aB.order;
      });

      // Append react elements
      group.attrs.forEach(attr => {
        if (attr.name === "state"){ 
          attr.action = this.handleChange
        }
        const FormInput = forms[attr.kind]
        let val

        if (topic && topic.attrs && topic.attrs.hasOwnProperty(attr.name)) {
          val = topic.attrs[attr.name]
        }
        //console.log(attr, attr.name, val)
        group.react.push(<FormInput key={attr.name} {...attr} value={val} />)
      })
    })

    this.setState({
      allAttrs: groupedAttrs
    })
  }

  componentDidMount() {

    const value = this.props.topic ? this.props.topic.attrs.state : "pendiente" 
    this.changeFields(value)
  }

  changeFields(value) {
    if (value === "factible" || value === "ganador")  {
      this.setState({
        groupedAttrs: this.state.allAttrs
      }) 
    } else {
      this.setState({
        groupedAttrs: this.state.allAttrs.filter((group) => group.name === "")
      })
    }
    // if (value !== "factible") {
    //   this.setState({
    //     groupedAttrs: this.state.allAttrs.filter((group) => group.name === "")
    //   })
    // } else {
    //   this.setState({
    //     groupedAttrs: this.state.allAttrs
    //   }) 
    // }
  }

  handleChange(ev) {
    ev.preventDefault()
    this.changeFields(ev.target.value)
  }

  render() {

    return (
      <div className='attrs'>
        { this.state.groupedAttrs.map(group => group.react) }
      </div>
    )

  }

}


// export default ({ forum, topic }) => {



//   let groupedAttrs = [];

//   // Load groups
//   forum.topicsAttrs.forEach(topicAttr => {
//     let attrGroup = groupedAttrs.find(groupEle => groupEle.name == topicAttr.group)
//     if (!attrGroup){
//       attrGroup = {
//         name: topicAttr.group || '',
//         order: topicAttr.groupOrder || 0,
//         attrs: [],
//         react: []
//       }
//       attrGroup.name && attrGroup.react.push(<h5 className="subtitle col-md-12">{attrGroup.name}</h5>)
//       groupedAttrs.push(attrGroup)
//     }
//     attrGroup.attrs.push(topicAttr)
//   })

//   // Sort groups and attrs in groups
//   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
//   groupedAttrs.sort(function(gA, gB) {
//     return gA.order - gB.order;
//   });

//   groupedAttrs.forEach(group => {
//     group.attrs.sort(function(aA, aB) {
//       return aA.order - aB.order;
//     });

//     // Append react elements
//     group.attrs.forEach(attr => {
//       if (attr.name === "state"){ 
//         attr.action = handleChange
//       }
//       const FormInput = forms[attr.kind]
//       let val

//       if (topic && topic.attrs && topic.attrs.hasOwnProperty(attr.name)) {
//         val = topic.attrs[attr.name]
//       }
//       //console.log(attr, attr.name, val)
//       group.react.push(<FormInput key={attr.name} {...attr} value={val} />)
//     })
//   })

//   return (
//     <div className='attrs'>
//       { groupedAttrs.map(group => group.react) }
//     </div>
//   )

// }

const forms = {}

forms.Number = ({
  name,
  title,
  description,
  mandatory,
  min,
  max,
  value,
  icon,
  width,
  hide
}) => (
  <div className={`form-group kind-number col-md-${width} ${hide ? 'hide' : ''}`}>
    { icon && <img className='title-icon' src={`/lib/admin/admin-topics-form/${icon}`} /> }
    <label id={`anchor-attrs.${name}`}>{title}</label>
    {description && <span className='help-text'>{description}</span>}
    <input
      className='form-control'
      type='number'
      name={`attrs.${name}`}
      defaultValue={value}
      min={min}
      max={max}
      required={mandatory}
      validate={mandatory && 'required'} />
  </div>
)

forms.String = ({
  name,
  title,
  description,
  mandatory,
  min,
  max,
  value,
  icon,
  width,
  hide
}) => (
  <div className={`form-group kind-string col-md-${width} ${hide ? 'hide' : ''}`}>
    { icon && <img className='title-icon' src={`/lib/admin/admin-topics-form/${icon}`} /> }
    <label id={`anchor-attrs.${name}`}>{title}</label>
    {description && <span className='help-text'>{description}</span>}
    <input
      className='form-control'
      type='text'
      name={`attrs.${name}`}
      defaultValue={value}
      minLength={min}
      maxLength={max}
      required={mandatory}
      validate={mandatory && 'required'} />
  </div>
)

forms.LongString = ({
  name,
  title,
  description,
  mandatory,
  min,
  max,
  value,
  icon,
  width,
  hide
}) => (
  <div className={`form-group kind-string col-md-${width} ${hide ? 'hide' : ''}`}>
    { icon && <img className='title-icon' src={`/lib/admin/admin-topics-form/${icon}`} /> }
    <label id={`anchor-attrs.${name}`}>{title}</label>
    {description && <span className='help-text'>{description}</span>}
    <textarea
      className='form-control'
      type='text'
      name={`attrs.${name}`}
      defaultValue={value}
      minLength={min}
      maxLength={max}
      required={mandatory}
      validate={mandatory && 'required'} />
  </div>
)

forms.Enum = ({
  name,
  title,
  description,
  mandatory,
  options,
  value,
  icon,
  width,
  hide,
  action
}) => (
  <div className={`form-group kind-enum col-md-${width} ${hide ? 'hide' : ''}`}>
    { icon && <img className='title-icon' src={`/lib/admin/admin-topics-form/${icon}`} /> }
    <label id={`anchor-attrs.${name}`}>{title}</label>
    {description && <span className='help-text'>{description}</span>}
    {
      name === "state" ?
        <select
          className='form-control'
          name={`attrs.${name}`}
          defaultValue={value}
          onChange={action}
          required={mandatory}
          validate={mandatory && 'required'}>
          {options.map((opt) => (
            <option key={opt.name} value={opt.name}>{opt.title}</option>
          ))}
        </select> :
        <select
          className='form-control'
          name={`attrs.${name}`}
          defaultValue={value}
          required={mandatory}
          validate={mandatory && 'required'}>
          {options.map((opt) => (
            <option key={opt.name} value={opt.name}>{opt.title}</option>
          ))}
      </select>      
    }
  </div>
)

forms.Boolean = class extends Component {
  constructor (props) {
    super(props)

    this.state = {
      checked: props.value
    }
  }

  handleChange = (evt) => {
    this.setState({
      checked: !this.state.checked
    })
  }

  render () {
    const {
      name,
      title,
      description,
      mandatory,
      icon,
      width
    } = this.props

    return (
      <div className='checkbox kind-boolean'>
        <label>
          {!this.state.checked && (
            <input
              type='hidden'
              value='false'
              name={`attrs.${name}`} />
          )}
          <input
            type='checkbox'
            onChange={this.handleChange}
            defaultChecked={this.state.checked}
            defaultValue={this.state.checked ? 'true' : undefined}
            name={this.state.checked ? `attrs.${name}` : undefined}
            required={mandatory}
            validate={mandatory && 'required'} />
          <span className='attrs-title'>{title}</span>
          {description && <span className='help-text'>{description}</span>}
        </label>
      </div>
    )
  }
}
