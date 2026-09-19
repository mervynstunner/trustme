'use client'

import { Button, Container, Form, InputGroup } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { useContext, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useStore } from '../Store'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export default function OnboardingPage() {
  const router = useRouter()
  const { dispatch: ctxDispatch } = useContext(useStore)

  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    organizationName: '',
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  })

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.organizationName || !form.username || !form.password) {
      toast.error('Organization name, username and password are required')
      return
    }

    toast.promise(
      axios.post('/api/auth/register-organization', form),
      {
        pending: 'Creating your organization...',
        success: 'Organization created!',
        error: {
          render({ data }) {
            return data?.response?.data?.message || 'Failed to create organization'
          }
        }
      }
    )
      .then((response) => {
        ctxDispatch({ type: 'SET_USER', payload: response.data })
        router.push('/dashboard')
      })
      .catch((error) => {
        console.error('Onboarding error:', error)
      })
  }

  return (
    <Container fluid='md'
      className="col-md-4 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Form className="w-100 border rounded p-3 shadow-sm my-4" onSubmit={handleSubmit}>
        <h3 className='text-muted'>CREATE YOUR ORGANIZATION</h3>
        <hr />

        <Form.Group className="mb-2" controlId="onboardingOrgName">
          <Form.Label>ORGANIZATION NAME</Form.Label>
          <Form.Control type='text' name='organization' autoComplete='organization' value={form.organizationName} onChange={update('organizationName')} required />
        </Form.Group>

        <Form.Group className="mb-2" controlId="onboardingFirstName">
          <Form.Label>YOUR FIRST NAME</Form.Label>
          <Form.Control type='text' name='given-name' autoComplete='given-name' value={form.firstname} onChange={update('firstname')} />
        </Form.Group>

        <Form.Group className="mb-2" controlId="onboardingLastName">
          <Form.Label>YOUR LAST NAME</Form.Label>
          <Form.Control type='text' name='family-name' autoComplete='family-name' value={form.lastname} onChange={update('lastname')} />
        </Form.Group>

        <Form.Group className="mb-2" controlId="onboardingEmail">
          <Form.Label>EMAIL</Form.Label>
          <Form.Control type='email' name='email' autoComplete='email' value={form.email} onChange={update('email')} />
        </Form.Group>

        <Form.Group className="mb-2" controlId="onboardingPhone">
          <Form.Label>PHONE</Form.Label>
          <Form.Control type='text' name='tel' autoComplete='tel' value={form.phone} onChange={update('phone')} />
        </Form.Group>

        <Form.Group className="mb-2" controlId="onboardingUsername">
          <Form.Label>USERNAME</Form.Label>
          <Form.Control type='text' name='username' autoComplete='username' value={form.username} onChange={update('username')} required />
        </Form.Group>

        <Form.Group className="mb-2" controlId="onboardingPassword">
          <Form.Label>PASSWORD</Form.Label>
          <InputGroup>
            <Form.Control type={showPassword ? 'text' : 'password'} name='new-password' autoComplete='new-password' value={form.password} onChange={update('password')} required />
            <Button type="button" variant="outline-secondary" onClick={() => setShowPassword((prev) => !prev)}
              title={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button variant="success" type="submit" className="my-3 w-100">CREATE ORGANIZATION</Button>
        <div className="text-center small text-muted">
          Already have an account? <Link href="/">Log in</Link>
        </div>
      </Form>
    </Container>
  )
}
