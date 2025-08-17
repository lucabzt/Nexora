import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Text,
  Anchor,
  Stack,
  Divider,
  Image,
  useMantineColorScheme,
  useMantineTheme,
  Group,
  Checkbox
} from "@mantine/core";
import { IconSun, IconMoonStars } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useAuth } from "../contexts/AuthContext";
import authService from "../api/authService";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useTranslation, Trans } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";


function Register() {
  const { t } = useTranslation("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  
  // Use white logo for dark theme, black for light theme
  const logoPath = colorScheme === 'dark' ? '/logo_white.png' : '/logo_black.png';

  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptPrivacyPolicy: false,
    },
    validate: {
      username: (value) =>
        !value
          ? t("usernameRequired")
          : value.length < 3
          ? t("usernameLength", "Username must be at least 3 characters")
          : null,
      email: (value) =>
        !value
          ? t("emailRequired", "Email is required")
          : !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? t("emailInvalid", "Please enter a valid email address (e.g., example@domain.com)")
          : null,
      password: (value) =>
        !value
          ? t("passwordRequired")
          : value.length < 3
          ? t("passwordLength")
          : null,
      confirmPassword: (value, values) =>
        value !== values.password
          ? t("passwordsDoNotMatch", "Passwords do not match")
          : null,
      acceptPrivacyPolicy: (value) =>
        !value ? t("privacyPolicyRequired") : null,
    },
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError(""); // Clear previous errors
    try {
      const result = await register(
        values.username,
        values.email,
        values.password
      );

      if (result) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Register page: reg failed", error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with an error status code
        const responseData = error.response.data || {};
        
        // Check for specific error messages in the response
        if (responseData.detail) {
          // If there's a detail message from the backend, use it
          setError(responseData.detail);
          
          // Check for username or email conflicts in the error message
          if (responseData.detail.toLowerCase().includes('username')) {
            form.setFieldError('username', responseData.detail);
          } else if (responseData.detail.toLowerCase().includes('email')) {
            form.setFieldError('email', responseData.detail);
          }
        } else if (error.response.status === 422) {
          // Handle validation errors (like invalid email format)
          if (responseData.message?.includes('email')) {
            const errorMsg = t("emailInvalid", "Invalid email address");
            setError(errorMsg);
            form.setFieldError('email', errorMsg);
          } else if (responseData.message) {
            setError(responseData.message);
          } else {
            const errorMsg = t("registrationFailed", "Registration failed. Please check your details and try again.");
            setError(errorMsg);
          }
        } else if (error.response.status === 400) {
          // For 400 errors, try to get the first error message if available
          const errorMessage = responseData.detail || 
                              (responseData.message && typeof responseData.message === 'string' ? responseData.message : null) ||
                              t("badRequest", "Invalid request. Please check your details and try again.");
          setError(errorMessage);
          
          // Try to set field-level errors for common 400 errors
          if (responseData.detail) {
            if (responseData.detail.toLowerCase().includes('username')) {
              form.setFieldError('username', responseData.detail);
            } else if (responseData.detail.toLowerCase().includes('email')) {
              form.setFieldError('email', responseData.detail);
            } else if (responseData.detail.toLowerCase().includes('password')) {
              form.setFieldError('password', responseData.detail);
            }
          }
        } else if (error.response.status === 409) {
          // For 409 conflicts, check if it's email or username that already exists
          let conflictMessage = responseData.detail || 
                              (responseData.message?.includes('email') ? 
                                t("userExists", "An account with this email already exists.") :
                                t("usernameExists", "This username is already taken."));
          
          // If we couldn't determine the conflict type from the message, try to guess from the detail
          if (responseData.detail) {
            if (responseData.detail.toLowerCase().includes('email')) {
              conflictMessage = t("userExists", "An account with this email already exists.");
              form.setFieldError('email', conflictMessage);
            } else if (responseData.detail.toLowerCase().includes('username')) {
              conflictMessage = t("usernameExists", "This username is already taken.");
              form.setFieldError('username', conflictMessage);
            }
          }
          
          setError(conflictMessage);
        } else {
          // For other error status codes, use the error message if available, or a generic one
          const errorMessage = responseData.detail || 
                              (responseData.message && typeof responseData.message === 'string' ? responseData.message : null) ||
                              t("registrationError", "An error occurred during registration. Please try again later.");
          setError(errorMessage);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError(t("networkError", "Network error. Please check your connection and try again."));
      } else {
        // Something happened in setting up the request
        setError(t("requestError", "An error occurred. Please try again."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authService.redirectToGoogleOAuth();
  };

  // GitHub and Discord login handlers removed from UI but kept in code for future use

  return (
    <Container size={460} my={40}>
      <Group position="center" align="center" spacing="xs" mb={20}>

              <Stack spacing="xxs">
                <Title order={1} size={32} weight={700} align="center">
                  {t("welcomeBack")}
                </Title>
                <Text color="dimmed" size="lg" align="center" mb="xl">
                  {t("signInToContinue")}
                </Text>
              </Stack>
            </Group>

      <Paper withBorder p={30} radius="md">
        <Button
          leftIcon={<IconBrandGoogleFilled size={20} />}
          variant="default"
          fullWidth
          size="md"
          onClick={handleGoogleLogin}
          mb="xl"
          style={{ height: 46 }}
        >
          {t("continueWithGoogle")}
        </Button>
        
        <Divider 
          label={
            <Text size="sm" color="dimmed">
              {t("orContinueWithEmail")}
            </Text>
          } 
          labelPosition="center" 
          my="lg" 
        />
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          {error && (
            <Text color="red" size="sm" mb="md">
              {error}
            </Text>
          )}
          <Stack spacing="md">
            <TextInput
              label={t("username")}
              placeholder={t("usernamePlaceholder")}
              required
              size="md"
              {...form.getInputProps("username")}
            />
            
            <TextInput
              label={t("email")}
              placeholder={t("emailPlaceholder", "Your email")}
              required
              size="md"
              {...form.getInputProps("email")}
            />
            
            <PasswordInput
              label={t("password")}
              placeholder={t("passwordPlaceholder")}
              required
              size="md"
              {...form.getInputProps("password")}
            />
            
            <PasswordInput
              label={t("confirmPassword")}
              placeholder={t("confirmPasswordPlaceholder", "Confirm your password")}
              required
              size="md"
              {...form.getInputProps("confirmPassword")}
            />

            <Checkbox
                mt="md"
                label={
                  <Trans i18nKey="auth:privacyPolicyAcceptance" components={[<RouterLink to={t('auth:privacyPolicyLink')} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }} />]}/>
                }
                required
                {...form.getInputProps('acceptPrivacyPolicy', { type: 'checkbox' })}
                style={{ marginTop: '1.5rem' }}
              />

              <Button 
                fullWidth 
                type="submit" 
                size="md" 
                loading={isLoading} 
                style={{ height: 46 }}
                disabled={!form.values.acceptPrivacyPolicy}
              >
                {t("signUp")}
              </Button>
            </Stack>
        </form>

        <Text align="center" mt="lg">
          {t("haveAccount")}{" "}
          <Anchor component={Link} to="/auth/login" weight={600}>
            {t("signIn")}
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}

export default Register;
