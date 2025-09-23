import React from 'react'
import ApplicationsTable from './ApplicationsTable'

export default function Applications({styles}) {
  return (
    <><p className={styles.applicationsTitle}>Applications List</p>
    <ApplicationsTable styles={styles} /></>
  )
}
