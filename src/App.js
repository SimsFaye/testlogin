import './index.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

const supabase = createClient('https://tatdwkwtalnwafiggdrt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdGR3a3d0YWxud2FmaWdnZHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyOTI3MTIsImV4cCI6MjA1NTg2ODcxMn0.tT36omXlDbjbXcqBqtEdlzJugehPGqz50nFgx9GH3G0')

const sendJWTToBackend = async (session) => {
  if (session?.access_token) {
    try {
      const response = await fetch('https://apifoxmock.com/m1/5831386-5516974-default/testlogin', {
        method: 'GET',
        headers: {
          'Authorization': session.access_token
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending JWT to backend:', error);
      return null;
    }
  }
  return null;
}

export default function App() {
  const [session, setSession] = useState(null)
  const [backendResponse, setBackendResponse] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        const response = await sendJWTToBackend(session)
        setBackendResponse(response)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        const response = await sendJWTToBackend(session)
        setBackendResponse(response)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />)
  }
  else {
    return (
      <div>
        <h2>登录成功！</h2>
        {backendResponse && (
          <div>
            <h3>后端返回信息：</h3>
            <p>{backendResponse.data}</p>
          </div>
        )}
      </div>
    )
  }
}