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
  Group
} from "@mantine/core";
import { IconSun, IconMoonStars } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useAuth } from "../contexts/AuthContext";
import authService from "../api/authService";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";


function Register() {
  const { t } = useTranslation("auth");
  const [isLoading, setIsLoading] = useState(false);
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
    },
    validate: {
      username: (value) =>
        !value
          ? t("usernameRequired")
          : value.length < 3
          ? t("usernameLength", "Username must be at least 3 characters")
          : null,
      email: (value) =>
        !/^\S+@\S+$/.test(value)
          ? t("emailInvalid", "Invalid email address")
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
    },
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      // The login function from AuthContext now returns the user object on success
      // or throws an error on failure.
      const result = await register(
        values.username,
        values.email,
        values.password
      );

      // If login is successful and returns a user object, navigate.
      if (result) {
        navigate("/dashboard"); // Navigate to the dashboard
      }

      // No explicit 'else' needed here because if 'user' is not returned,
      // an error would have been thrown by the login() function and caught below.
    } catch (error) {
      // Errors (e.g., invalid credentials, network issues) are already handled by
      // the login function in AuthContext (it shows a toast).
      // You can add additional error handling specific to this page if needed.
      console.error("Register page: reg failed", error);
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
              <Image src={logoPath} width={80} mb="md" alt="Nexora Logo" />
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

            <Button
              fullWidth
              type="submit"
              size="md"
              loading={isLoading}
              style={{ height: 46 }}
            >
              {t("signUp")}
            </Button>
          </Stack>
        </form>

        <Text align="center" mt="lg">
          {t("haveAccount")}{" "}
          <Anchor component={Link} to="/login" weight={600}>
            {t("signIn")}
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}

export default Register;
