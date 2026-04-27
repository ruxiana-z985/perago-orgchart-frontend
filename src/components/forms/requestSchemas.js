import * as yup from 'yup'

// Email validation: only allow @perago.com or specific user
const allowedEmails = ['ruxiana985@gmail.com']
const emailDomain = '@perago.com'

const validateEmail = (value) => {
  if (!value) return false
  const email = value.toLowerCase()
  return allowedEmails.includes(email) || email.endsWith(emailDomain)
}

const emailValidation = yup.string()
  .required('Requester email is required')
  .email('Invalid email format')
  .test('allowed-email', 'Only @perago.com emails or ruxiana985@gmail.com are allowed', validateEmail)

export const createRequestSchema = yup.object({
  parentId: yup.string().nullable(),
  name: yup.string().required('Position name is required').min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  description: yup.string().required('Description is required').min(5, 'Description must be at least 5 characters').max(500, 'Description must be at most 500 characters'),
  requesterName: yup.string().required('Requester name is required').min(2, 'Name must be at least 2 characters'),
  requesterEmail: emailValidation,
})

export const updateRequestSchema = yup.object({
  targetPositionId: yup.string().required('Target position is required'),
  name: yup.string().required('Position name is required').min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  description: yup.string().required('Description is required').min(5, 'Description must be at least 5 characters').max(500, 'Description must be at most 500 characters'),
  newParentId: yup.string().nullable(),
  requesterName: yup.string().required('Requester name is required').min(2, 'Name must be at least 2 characters'),
  requesterEmail: emailValidation,
})

export const deleteRequestSchema = yup.object({
  targetPositionId: yup.string().required('Target position is required'),
  reassignmentStrategy: yup.string().when('hasChildren', {
    is: true,
    then: (schema) => schema.required('Reassignment strategy is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  requesterName: yup.string().required('Requester name is required').min(2, 'Name must be at least 2 characters'),
  requesterEmail: emailValidation,
})
