import React, { useState } from 'react'
const API_BASE = 'http://localhost:5000'
export default function App(){
  const [studentId,setStudentId]=useState('')
  const [materials,setMaterials]=useState([])
  const [email,setEmail]=useState('')
  const [phone,setPhone]=useState('')
  const [loading,setLoading]=useState(false)
  async function fetchMaterials(){
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/get-materials`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId})})
      const data = await res.json()
      if(data.success) setMaterials(data.materials); else { setMaterials([]); alert(data.message) }
    }catch(e){ alert('Failed to fetch') } finally { setLoading(false) }
  }
  async function sendEmail(){
    const text = materials.join('\n'); if(!email) return alert('Enter email'); if(!text) return alert('No materials')
    const res = await fetch(`${API_BASE}/send-email`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:email,subject:`Materials for ${studentId}`,text})})
    const data = await res.json(); data.success? alert('Email sent!') : alert('Email failed: '+data.message)
  }
  async function sendWhatsApp(){
    const text = materials.join('\n'); if(!phone) return alert('Enter WhatsApp number'); if(!text) return alert('No materials')
    const res = await fetch(`${API_BASE}/send-whatsapp`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:phone,text})})
    const data = await res.json(); data.success? alert('WhatsApp sent!') : alert('WhatsApp failed: '+data.message)
  }
  return (<div style={{maxWidth:720,margin:'40px auto',fontFamily:'system-ui'}}>
    <h1>📚 Smart Study Material Platform</h1>
    <div style={{display:'flex',gap:8}}>
      <input placeholder='Enter Student ID (e.g., S1001)' value={studentId} onChange={e=>setStudentId(e.target.value)}/>
      <button onClick={fetchMaterials} disabled={loading}>{loading?'Loading...':'Get Materials'}</button>
    </div>
    <h3 style={{marginTop:20}}>Materials:</h3>
    <ul>{materials.map((m,i)=><li key={i}>{m}</li>)}</ul>
    <div style={{marginTop:20,display:'grid',gap:8}}>
      <h3>Send Materials</h3>
      <div><input placeholder='Email address' value={email} onChange={e=>setEmail(e.target.value)}/>
      <button onClick={sendEmail}>Send Email</button></div>
      <div><input placeholder='WhatsApp number e.g., +91XXXXXXXXXX' value={phone} onChange={e=>setPhone(e.target.value)}/>
      <button onClick={sendWhatsApp}>Send WhatsApp</button></div>
    </div></div>)
}
