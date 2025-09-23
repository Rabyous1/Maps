import React from 'react'
import OpportunityForm from './OpportunityForm'

export default function AddOpportunity({styles}) {
  return (
    <><p className={styles.addOpportunityTitle}>Create job offer</p><OpportunityForm  styles={styles}/></>
  )
}
