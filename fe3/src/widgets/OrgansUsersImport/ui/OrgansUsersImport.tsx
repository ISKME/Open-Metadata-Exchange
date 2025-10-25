/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';
// global components folder
import { CButton } from 'pages/Case/ui/components';
import req from 'shared/lib/req';
import cls from './OrgansUsersImport.module.scss'

function jsonToReadableText(json) {
  function processValue(value) {
    if (Array.isArray(value))
      return value.map(processValue).join(', ')
    else if (typeof value === 'object' && value !== null)
      return Object.entries(value).map(([key, val]) => `${isNaN(key) ? key + ': ' : ''} ${processValue(val)}`).join(', ')
    return value
  }
  return processValue(json)
}

export function OrgansUsersImport({ id, onCancel = () => { } }) {
  // const [csrf, setCsrf] = useState('')
  // useEffect(() => {
  //   axios.get('/api/csrf-token').then(({ data }) => {
  //     setCsrf(data.token)
  //   })
  // }, [])

  function importing() {
    const members = document.querySelector('#members')?.files[0]
    if (!members) return alert('Please select a file to import.')
    req.post(`organizations/v2/organizations/${id}/members/import`, { members }, true)
    .then((data) => {
      alert(`Successful:\n\n${jsonToReadableText(data)}`)
      window.location.reload()
    })
    .catch((data) => alert(`Creation error:\n\n${jsonToReadableText(data)}`))
  }

  return (
    <div className={cls.container}>
      <Typography variant="h5" component="h2">
        Import Users
      </Typography>
      <a href="/static/ImportOrgMembersTemplate.csv" className={cls.downloadLink}>
        <i className="fa fa-download" style={{ marginRight: '8px' }} />
        Download User Roster Template
      </a>
      <Typography>
        <p>
        Please list your organization’s name and the user role separated by a colon (no spaces).
        The Organization name must be entered exactly as it appears on your dashboard.
        </p>
        <div className={cls.bulletList}>
          <p className={cls.bulletItem}>Organization:Instructor</p>
          <p className={cls.bulletItem}>Organization:Student</p>
          <p className={cls.bulletItem}>Organization:Admin</p>
        </div>
        <p>Note the first letter of the role must be capitalized.</p>
        <p className={cls.uploadLabel}>Upload completed template</p>
        <input type="file" name="members" id="members" required />
        {/* <input type="hidden" name="csrfmiddlewaretoken" value={csrf} /> */}
      </Typography>
      <div className={cls.actionButtons}>
        {/* <CButton type="submit">Import</CButton> */}
        <CButton onClick={importing}>Import</CButton>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}
