import React from 'react'
import { connect } from 'react-redux'

export const Plan = (props) => {
  return (
    <div>Hello World</div>
  )
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Plan)