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

const handleEmailConfirmation = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('重新发送确认邮件时出错:', error.message)
      return
    }
    
    alert('确认邮件已发送，请查收')
  } catch (error) {
    console.error('发送确认邮件时出错:', error)
  }
}

const handlePasswordReset = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    
    if (error) {
      console.error('发送重置密码邮件时出错:', error.message)
      return
    }
    
    alert('重置密码邮件已发送，请查收')
  } catch (error) {
    console.error('重置密码时出错:', error)
  }
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

    // 修复邮箱确认状态监听
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'EMAIL_CONFIRMED') {
        alert('邮箱已成功验证！')
      }
    })

    return () => {
      subscription.unsubscribe()
      authSubscription?.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('退出登录时出错:', error)
    } else {
      setSession(null)
      setBackendResponse(null)
    }
  }

  if (!session) {
    return (
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['github', 'google']}
        redirectTo={window.location.origin}
        requireEmailConfirmation={true}
        localization={{
          variables: {
            sign_up: {
              email_label: '电子邮箱',
              password_label: '密码',
              button_label: '注册',
              loading_button_label: '注册中...',
              link_text: '没有账号？立即注册',
            },
            sign_in: {
              email_label: '电子邮箱',
              password_label: '密码',
              button_label: '登录',
              loading_button_label: '登录中...',
              link_text: '已有账号？立即登录',
            },
            // 自定义每个提供商的文本
            providers: {
              github: '使用 GitHub 账号',
              google: '使用 Google 账号',
            },
            confirmation: {
              email_confirmed: '邮箱已确认',
              confirmation_text: '请检查您的邮箱以确认注册',
              button_label: '重新发送确认邮件',
              loading_button_label: '发送中...',
            },
            forgotten_password: {
              email_label: '电子邮箱',
              password_label: '密码',
              button_label: '发送重置密码邮件',
              loading_button_label: '发送中...',
              confirmation_text: '如果您的邮箱地址正确，您将收到重置密码的邮件',
            }
          },
        }}
      />
    )
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
        <button onClick={handleSignOut}>退出登录</button>
      </div>
    )
  }
}