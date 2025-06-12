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
  Divider, // Import Divider
  Box, // Import Box for spacing if needed
  Group, // Import Group for button grouping
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAuth } from "../contexts/AuthContext";
import authService from "../api/authService"; // Import authService
import {
  IconBrandGithubFilled,
  IconBrandGoogleFilled,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import discordGif from "../assets/wired-flat-2566-logo-discord-hover-wink.gif"; // Import local Discord GIF

// Use Discord GIF icon from local asset
const DiscordIcon = (props) => {
  const { t } = useTranslation("auth");
  return (
    <img
      src={discordGif}
      alt={t("discordAltText")}
      width={32}
      height={32}
      style={{ display: "block" }}
      {...props}
    />
  );
};

function Register() {
  const { t } = useTranslation("auth");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

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

  const handleGithubLogin = () => {
    authService.redirectToGithubOAuth();
  };

  const handleDiscordLogin = () => {
    authService.redirectToDiscordOAuth();
  };

  return (
    <Container
      size="xs"
      py="md"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {" "}
      <Title align="center" mb="md">
        {t("registerTitle")}
      </Title>
      <Paper withBorder shadow="md" p="xl" radius="md" mt="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label={t("username")}
            placeholder={t("usernamePlaceholder")}
            required
            {...form.getInputProps("username")}
            mb="md"
          />
          <TextInput
            label={t("email")}
            placeholder={t("emailPlaceholder", "Your email")}
            required
            {...form.getInputProps("email")}
            mb="md"
          />
          <PasswordInput
            label={t("password")}
            placeholder={t("passwordPlaceholder")}
            required
            {...form.getInputProps("password")}
            mb="md"
          />
          <PasswordInput
            label={t("confirmPassword")}
            placeholder={t(
              "confirmPasswordPlaceholder",
              "Confirm your password"
            )}
            required
            {...form.getInputProps("confirmPassword")}
            mb="lg"
          />
          <Button
            fullWidth
            type="submit"
            variant="gradient"
            gradient={{ from: "cyan", to: "teal", deg: 45 }}
            loading={isLoading}
          >
            {t("signUp")}
          </Button>
          <Divider label={t("continueWith")} labelPosition="center" my="md" />
          <Group position="center" spacing="md" mb="lg">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              px="md"
              style={{ width: 48, height: 48, padding: 0 }}
            >
              <IconBrandGoogleFilled size={24} />
            </Button>
            <Button
              variant="outline"
              onClick={handleGithubLogin}
              px="md"
              style={{ width: 48, height: 48, padding: 0 }}
            >
              <IconBrandGithubFilled size={24} />
            </Button>
            <Button
              variant="outline"
              onClick={handleDiscordLogin}
              px="md"
              style={{ width: 48, height: 48, padding: 0 }}
            >
              <DiscordIcon />
            </Button>
          </Group>{" "}
          <Text align="center" mt="md">
            {t("haveAccount")}{" "}
            <Anchor component={Link} to="/login">
              {t("signIn")}
            </Anchor>
          </Text>
        </form>
      </Paper>
    </Container>
  );
}

export default Register;
