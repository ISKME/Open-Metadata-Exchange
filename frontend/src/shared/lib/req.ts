// @ts-nocheck
import axios from 'axios'

// temp csrf var & timer
const csrf = () => new Promise((res) => axios.get('/api/csrf-token/').then(({ data }) => res(data.token)))

export default {
  post: (url, body, form = false) => new Promise(async (res, rej) => {
    try {
      const token = await csrf()
      const headers = { 'X-Csrftoken': token, 'Content-Type': form ? 'multipart/form-data' : 'application/json;charset=UTF-8' }
      if (form) {
        const formData = new FormData()
        for (const key in body) {
          const value = body[key]
          if (value !== undefined && value !== null)
            formData.append(key, value)
        }
        body = formData
      }
      const { data } = await axios.post((url.startsWith('/') || url.startsWith('http')) ? url : ('/api/' + url), body, { headers })
      res(data)
    } catch (e) {
      rej(e?.response?.data || e)
    }
  }),
  put: (url, body, form = false) => new Promise(async (res, rej) => {
    try {
      const token = await csrf()
      const headers = { 'X-Csrftoken': token, 'Content-Type': form ? 'multipart/form-data' : 'application/json;charset=UTF-8' }
      if (form) {
        const formData = new FormData()
        for (const key in body) {
          const value = body[key]
          if (value !== undefined && value !== null)
            formData.append(key, value)
        }
        body = formData
      }
      const { data } = await axios.put(url.startsWith('/api/') ? url : '/api/' + url, body, { headers })
      res(data)
    } catch (e) {
      rej(e?.response?.data || e)
    }
  }),
  patch: (url, body, form = false) => new Promise(async (res, rej) => {
    try {
      const token = await csrf()
      const headers = { 'X-Csrftoken': token, 'Content-Type': form ? 'multipart/form-data' : 'application/json;charset=UTF-8' }
      if (form) {
        const formData = new FormData()
        for (const key in body) {
          const value = body[key]
          if (value !== undefined)
            formData.append(key, value)
        }
        body = formData
      }
      const { data } = await axios.patch(url.startsWith('/api/') ? url : '/api/' + url, body, { headers })
      res(data)
    } catch (e) {
      rej(e?.response?.data || e)
    }
  }),
  del: (url, body = {}) => new Promise(async (res, rej) => {
    try {
      const token = await csrf()
      const headers = { 'X-Csrftoken': token }
      const { data } = await axios.delete(url.startsWith('/api/') ? url : '/api/' + url, { data: body, headers })
      res(data)
    } catch (e) {
      rej(e?.response?.data || e)
    }
  })
}
