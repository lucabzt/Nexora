import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextInput, 
  PasswordInput, 
  Paper, 
  Title, 
  Container, 
  Button, 
  Text, 
  Anchor,
  Divider, // Import Divider
  Box // Import Box for spacing if needed
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../contexts/AuthContext';
import authService from '../api/authService'; // Import authService

function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) => !value ? 'Username is required' : value.length < 3 ? 'Username must be at least 3 characters' : null,
      email: (value) => !/^\S+@\S+$/.test(value) ? 'Invalid email address' : null,
      password: (value) => !value ? 'Password is required' : value.length < 3 ? 'Password must be at least 3 characters' : null,
      confirmPassword: (value, values) => value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      const result = await register(values.username, values.email, values.password);
      
      if (result.success) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authService.redirectToGoogleOAuth();
  };

  return (
    <Container size="xs" py="xl">
      <Title align="center" mb="lg">
        Create Account
      </Title>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            {...form.getInputProps('username')}
            mb="md"
          />

          <TextInput
            label="Email"
            placeholder="Your email"
            required
            {...form.getInputProps('email')}
            mb="md"
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            {...form.getInputProps('password')}
            mb="md"
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            {...form.getInputProps('confirmPassword')}
            mb="xl"
          />

          <Button fullWidth type="submit" loading={isLoading}>
            Register
          </Button>

          <Divider label="Or sign up with" labelPosition="center" my="lg" />

          <Button fullWidth variant="outline" onClick={handleGoogleLogin} mb="xl">
            Sign up with Google
          </Button>
          
          <Text align="center" mt="md">
            Already have an account?{' '}
            <Anchor component={Link} to="/login">
              Login
            </Anchor>
          </Text>
        </form>
      </Paper>
    </Container>
  );
}

export default Register;