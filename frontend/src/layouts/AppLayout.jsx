import { useState, useEffect } from "react";
import {
  Outlet,
  Link as RouterLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  AppShell,
  Header,
  Navbar,
  Group,
  Title,
  useMantineTheme,
  ActionIcon,
  Box,
  Avatar,
  Menu,
  useMantineColorScheme,
  Badge,
  UnstyledButton,
  Text,
  ThemeIcon,
  Stack,
  Divider,
  Drawer,
  Paper,
} from "@mantine/core";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import {
  IconSettings,
  IconSun,
  IconMoonStars,
  IconUser,
  IconLogout,
  IconHome2,
  IconPlus,
  IconChartLine,
  IconShieldCheck,
  IconInfoCircle,
  IconWorld,
  IconChevronRight,
  IconX,
  IconMenu2,
  IconFileExport,
} from "@tabler/icons-react";
import AppFooter from "../components/AppFooter";
import TrackActivity from "../components/TrackActivity";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import CourseSidebar from "../components/CourseSidebar"; // Import the new component
import { courseService } from "../api/courseService"; // To fetch course data

// MainLink component for sidebar navigation
export const MainLink = ({
  icon,
  color,
  label,
  to,
  isActive,
  collapsed,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const handleClick = () => {
    navigate(to);
    if (onNavigate) {
      onNavigate(); // Call the callback to close navbar on mobile
    }
  };

  return (
    <UnstyledButton
      onClick={handleClick}
      sx={(theme) => ({
        display: "block",
        width: "100%",
        // Make menu items higher and all the same size
        minHeight: 32,
        height: 48,
        padding: collapsed ? `16px 0` : `16px 16px 16px 16px`, // Adjust padding when collapsed
        borderRadius: theme.radius.md,
        marginBottom: theme.spacing.xs,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
        backgroundColor: isActive
          ? theme.colorScheme === "dark"
            ? theme.colors.dark[5]
            : theme.colors.gray[1]
          : "transparent",
        border: `1px solid ${
          isActive
            ? theme.colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.gray[3]
            : "transparent"
        }`,
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      })}
    >
      <Group
        spacing={collapsed ? 0 : 18}
        position={collapsed ? "center" : "left"}
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          flexWrap: "nowrap",
        }}
      >
        <ThemeIcon
          color={color}
          variant="light"
          size="lg"
          sx={{
            background: `linear-gradient(135deg, ${theme.colors[color][6]}20, ${theme.colors[color][4]}10)`,
            border: `1px solid ${theme.colors[color][6]}30`,
            marginLeft: collapsed ? 0 : 4, // Adjust margins when collapsed
            marginRight: collapsed ? 0 : 8,
          }}
        >
          {icon}
        </ThemeIcon>
        {!collapsed && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Text
              size="md"
              weight={600}
              mb={2}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {label}
            </Text>
            <Box
              sx={{
                height: 3,
                background: `linear-gradient(90deg, ${theme.colors[color][6]}, ${theme.colors[color][4]})`,
                borderRadius: 2,
                width: isActive ? "100%" : "0%",
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        )}
        {!collapsed && (
          <IconChevronRight
            size={18}
            style={{
              opacity: 0.6,
              transition: "transform 0.2s ease",
              marginLeft: 8,
            }}
          />
        )}
      </Group>
    </UnstyledButton>
  );
};

function AppLayout() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to get current path
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t } = useTranslation(["navigation", "app", "settings"]);
  const dark = colorScheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [opened, setOpened] = useState(!isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { width: viewportWidth } = useViewportSize();
  // Scale bottom navigation elements on very small screens (min 80% up to 100%)
  const scale = Math.min(1, Math.max(0.8, (viewportWidth || 420) / 580));
  const bottomIconSize = Math.round(28 * scale);
  const bottomTextSize = Math.max(10, Math.round(12 * scale));
  const bottomPadding = Math.max(6, Math.round(6 * scale));

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);

  // Check if the current route is a course or chapter view
  const courseViewMatch = location.pathname.match(
    /\/dashboard\/courses\/(\d+)/
  );
  const isCoursePage = !!courseViewMatch;
  const courseId = courseViewMatch ? courseViewMatch[1] : null;

  useEffect(() => {
    if (isCoursePage && courseId) {
      const fetchCourseData = async () => {
        try {
          const [courseData, chaptersData] = await Promise.all([
            courseService.getCourseById(courseId),
            courseService.getCourseChapters(courseId),
          ]);
          setCourse(courseData);
          setChapters(chaptersData || []);
        } catch (error) {
          console.error("Failed to fetch course data for sidebar:", error);
        }
      };
      fetchCourseData();
    } else {
      // Clear course data when not on a course page
      setCourse(null);
      setChapters([]);
    }
  }, [isCoursePage, courseId]);

  // Toggle navbar visibility
  const toggleNavbar = () => setOpened((o) => !o);

  // Update opened state when screen size changes
  useEffect(() => {
    // Only update if the user hasn't manually toggled the navbar
    // This prevents the navbar from changing when the user has specifically set it
    setOpened(!isMobile);
  }, [isMobile]);

  // Get current path to determine active link
  const currentPath = window.location.pathname;

  // Logic to determine avatar source
  let avatarSrc = null;
  if (user && user.profile_image_base64) {
    if (user.profile_image_base64.startsWith("data:image")) {
      avatarSrc = user.profile_image_base64;
    } else {
      avatarSrc = `data:image/jpeg;base64,${user.profile_image_base64}`;
    }
  }

  const mainLinksData = [
    {
      icon: <IconHome2 size={20} />,
      color: "blue",
      label: t("home", { ns: "navigation" }),
      to: "/dashboard",
    },
    {
      icon: <IconPlus size={20} />,
      color: "teal",
      label: t("newCourse", { ns: "navigation" }),
      to: "/dashboard/create-course",
    },
    {
      icon: <IconWorld size={22} />,
      color: "orange",
      label: t("publicCourses", { ns: "navigation", defaultValue: "Public Courses" }),
      to: "/dashboard/public-courses",
    },
    {
      icon: <IconSettings size={20} />,
      color: "grape",
      label: t("settings", { ns: "navigation" }),
      to: "/dashboard/settings",
    },
    {
      icon: <IconInfoCircle size={20} />,
      color: "gray",
      label: t("nexora", { ns: "navigation" }),
      to: "/",
    },
    // Admin link - only shown to admin users
    ...(user?.is_admin
      ? [
          {
            icon: <IconShieldCheck size={20} />,
            color: "red",
            label: t("adminArea", { ns: "navigation" }),
            to: "/admin",
          },    
          {
            icon: <IconFileExport size={20} />,
            color: "violet",
            label: "Anki Generator",
            to: "/dashboard/anki-generator",
          },
          {
            icon: <IconChartLine size={20} />,
            color: 'grape',
            label: t('statistics', { ns: 'navigation' }),
            to: '/dashboard/statistics',
          },
        ]
      : []),
  ];

  // Handler to close navbar on mobile when navigating
  const handleNavigate = () => {
    if (isMobile) {
      setOpened(false);
    }
  };

  const mainLinksComponents = mainLinksData.map((link) => (
    <MainLink
      {...link}
      key={link.label}
      isActive={currentPath === link.to}
      collapsed={!opened}
      onNavigate={handleNavigate}
    />
  ));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <TrackActivity user={user} />
      {/* Floating menu button removed; 'Mehr' lives in bottom navigation on mobile */}
      <AppShell
        styles={{
          main: {
            background: dark ? theme.colors.dark[8] : theme.colors.gray[0],
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            width: "100%",
            paddingRight: 0,
            overflowX: "hidden",
            // Ensure page content and footer are not covered by the mobile bottom navigation
            paddingBottom: isMobile ? 'calc(96px + env(safe-area-inset-bottom))' : 0,
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        header={
          isMobile ? (
            <Header
              height={{ base: 56, md: 0 }}
              p="md"
              sx={(theme) => ({
                background:
                  dark
                    ? `linear-gradient(135deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[8]} 100%)`
                    : `linear-gradient(135deg, ${theme.white} 0%, ${theme.colors.gray[0]} 100%)`,
                borderBottom: `1px solid ${dark ? theme.colors.dark[6] : theme.colors.gray[2]}`,
                boxShadow: dark
                  ? `0 4px 12px ${theme.colors.dark[9]}50`
                  : `0 4px 12px ${theme.colors.gray[3]}30`,
                zIndex: 200,
                position: 'relative',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Group spacing="xs">
                  <img
                    src={theme.colorScheme === 'dark' ? '/logo_white.png' : '/logo_black.png'}
                    alt="Logo"
                    style={{ height: 26, width: 'auto', filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))' }}
                  />
                  <Title
                    order={3}
                    size="1.4rem"
                    component={RouterLink}
                    to="/dashboard"
                    sx={(theme) => ({
                      textDecoration: 'none',
                      background: `linear-gradient(135deg, ${theme.colors.teal[6]}, ${theme.colors.cyan[4]})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800,
                      letterSpacing: '-1px',
                      display: 'inline-block',
                      position: 'relative',
                      padding: theme.spacing.xs,
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.02)', cursor: 'pointer' },
                    })}
                  >
                    {t('title', { ns: 'app' })}
                  </Title>
                </Group>
                <Box sx={{ flexGrow: 1 }} />
                <Group spacing="sm">
                  <ActionIcon
                    variant="outline"
                    color={dark ? 'yellow' : 'blue'}
                    onClick={() => toggleColorScheme()}
                    size="lg"
                    radius="md"
                    sx={{ transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.05)' } }}
                    aria-label={t('colorSchemeToggleTitle', { ns: 'app', defaultValue: 'Toggle color scheme' })}
                  >
                    {dark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
                  </ActionIcon>
                  <ActionIcon
                    variant="outline"
                    onClick={() => setMobileMenuOpen((o) => !o)}
                    size="lg"
                    radius="md"
                    aria-label={t('burgerAriaLabel', { ns: 'app', defaultValue: 'Toggle navigation' })}
                  >
                    <IconMenu2 size={20} />
                  </ActionIcon>
                </Group>
              </div>
            </Header>
          ) : undefined
        }
        navbar={
          <Navbar
            p={opened ? "md" : "xs"}
            hiddenBreakpoint="sm"
            hidden={isMobile || (!isMobile && !opened)}
            width={{
              sm: opened ? 250 : isMobile ? 0 : 80,
              lg: opened ? 300 : isMobile ? 0 : 80,
            }}
            sx={(theme) => ({
              background: dark
                ? `linear-gradient(180deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[8]} 100%)`
                : `linear-gradient(180deg, ${theme.white} 0%, ${theme.colors.gray[0]} 100%)`,
              borderRight: `1px solid ${
                dark ? theme.colors.dark[5] : theme.colors.gray[2]
              }`,
              boxShadow: dark
                ? `4px 0 12px ${theme.colors.dark[9]}30`
                : `4px 0 12px ${theme.colors.gray[3]}20`,
              transition: "width 0.3s ease, padding 0.3s ease",
              display: isMobile ? "none" : "flex",
              flexDirection: "column",
              zIndex: 150,
            })}
          >
            {/* Header section with logo, app name, and toggle */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: opened ? "space-between" : "center",
                marginBottom: theme.spacing.md,
                paddingBottom: theme.spacing.md,
                borderBottom: `1px solid ${
                  dark ? theme.colors.dark[5] : theme.colors.gray[2]
                }`,
                minHeight: 60,
              }}
            >
              {opened && (
                <Group spacing="xs">
                  <img
                    src={
                      theme.colorScheme === "dark"
                        ? "/logo_white.png"
                        : "/logo_black.png"
                    }
                    alt="Logo"
                    style={{
                      height: 28,
                      width: "auto",
                      filter: "drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))",
                    }}
                  />
                  <Title
                    order={3}
                    size="1.6rem"
                    component={RouterLink}
                    to="/dashboard"
                    sx={(theme) => ({
                      // gradient text
                      textDecoration: "none",
                      background: `linear-gradient(135deg, ${theme.colors.teal[6]}, ${theme.colors.cyan[4]})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 800,
                      letterSpacing: "-1px",

                      // keep the pseudo‐element for hover‐bg if you like
                      display: "inline-block",
                      position: "relative",
                      padding: theme.spacing.xs,

                      // smooth transition
                      transition: "transform 0.2s ease",

                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: theme.radius.sm,
                        background: "transparent",
                        zIndex: -1,
                        transition: "background 0.2s ease",
                      },

                      "&:hover": {
                        transform: "scale(1.02)",
                        cursor: "pointer",
                      },


                    })}
                  >
                    {t("title", { ns: "app" })}
                  </Title>
                </Group>
              )}

              <ActionIcon
                variant="outline"
                onClick={() => (isMobile ? setMobileMenuOpen(true) : setOpened((o) => !o))}
                size="lg"
                radius="md"
                sx={{
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
                aria-label={t("burgerAriaLabel", {
                  ns: "app",
                  defaultValue: "Toggle navigation",
                })}
              >
                {isMobile ? <IconMenu2 size={18} /> : opened ? <IconX size={18} /> : <IconMenu2 size={18} />}
              </ActionIcon>
            </Box>

            {/* Navigation Links - Scrollable Section */}
            <Navbar.Section
              grow
              mt="xs"
              sx={{
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: '1 1 auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[4],
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: dark ? theme.colors.dark[5] : theme.colors.gray[5],
                  },
                },
                paddingRight: '4px',
                marginRight: '-4px',
              }}
            >
              <Box pb="md">
                {isCoursePage ? (
                  <CourseSidebar opened={opened} setopen={setOpened} />
                ) : (
                  <Stack spacing="xs">{mainLinksComponents}</Stack>
                )}
              </Box>
            </Navbar.Section>

            {/* Profile section at bottom - Fixed */}
            <Box
              sx={{
                paddingTop: theme.spacing.md,
                borderTop: `1px solid ${
                  dark ? theme.colors.dark[5] : theme.colors.gray[2]
                }`,
                position: 'sticky',
                bottom: 0,
                zIndex: 100,
                paddingBottom: theme.spacing.sm,
                marginTop: 'auto',
              }}
            >
              {opened ? (
                // Full profile menu when expanded
                <Menu shadow="md" width={220} withinPortal={true} zIndex={300}>
                  <Menu.Target>
                    <UnstyledButton
                      sx={{
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.md,
                        transition: "all 0.2s ease",
                        width: "100%",
                        "&:hover": {
                          backgroundColor: dark
                            ? theme.colors.dark[6]
                            : theme.colors.gray[1],
                          transform: "scale(1.02)",
                        },
                      }}
                    >
                      <Group spacing="xs">
                        <Avatar
                          key={
                            avatarSrc || (user ? user.id : "app-layout-avatar")
                          }
                          src={avatarSrc}
                          radius="xl"
                          alt={
                            user.username ||
                            t("userAvatarAlt", {
                              ns: "app",
                              defaultValue: "User avatar",
                            })
                          }
                          color="cyan"
                          sx={{
                            cursor: "pointer",
                            border: `2px solid ${theme.colors.cyan[5]}40`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "scale(1.05)",
                              border: `2px solid ${theme.colors.cyan[5]}`,
                            },
                          }}
                        >
                          {!avatarSrc && user.username ? (
                            user.username.substring(0, 2).toUpperCase()
                          ) : !avatarSrc ? (
                            <IconUser size={18} />
                          ) : null}
                        </Avatar>
                        <Box>
                          <Text size="sm" weight={500}>
                            {user.username}
                          </Text>
                          <Badge
                            size="xs"
                            variant="light"
                            color="cyan"
                            sx={{ textTransform: "none" }}
                          >
                            {t("onlineStatusBadge", {
                              ns: "app",
                              defaultValue: "Online",
                            })}
                          </Badge>
                        </Box>
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown
                    sx={{
                      border: `1px solid ${
                        dark ? theme.colors.dark[4] : theme.colors.gray[3]
                      }`,
                      boxShadow: dark
                        ? `0 8px 24px ${theme.colors.dark[9]}70`
                        : `0 8px 24px ${theme.colors.gray[4]}40`,
                      zIndex: 300,
                    }}
                  >
                    <Menu.Item
                      icon={<IconSettings size={14} />}
                      onClick={() => navigate("/dashboard/settings")}
                      sx={{
                        "&:hover": {
                          backgroundColor: dark
                            ? theme.colors.dark[6]
                            : theme.colors.gray[1],
                        },
                      }}
                    >
                      {t("settings", { ns: "navigation" })}
                    </Menu.Item>
                    <Menu.Item
                      icon={
                        dark ? (
                          <IconSun size={14} />
                        ) : (
                          <IconMoonStars size={14} />
                        )
                      }
                      onClick={() => toggleColorScheme()}
                      sx={{
                        "&:hover": {
                          backgroundColor: dark
                            ? theme.colors.dark[6]
                            : theme.colors.gray[1],
                        },
                      }}
                    >
                      {t("theme", { ns: "settings" })}
                    </Menu.Item>

                    <Menu.Item
                      icon={<IconInfoCircle size={14} />}
                      onClick={() => {
                        navigate("/about");
                      }}
                      sx={{
                        "&:hover": {
                          backgroundColor: dark
                            ? theme.colors.dark[6]
                            : theme.colors.gray[1],
                        },
                      }}
                    >
                      {t("about", { ns: "navigation" })}
                    </Menu.Item>

                    <Divider />
                    <Menu.Item
                      icon={<IconLogout size={14} />}
                      onClick={handleLogout}
                      color="red"
                      sx={{
                        "&:hover": {
                          backgroundColor: `${theme.colors.red[6]}15`,
                        },
                      }}
                    >
                      {t("logout", { ns: "navigation" })}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                // Collapsed profile - just avatar
                <Group position="center">
                  <Menu
                    shadow="md"
                    width={220}
                    withinPortal={true}
                    zIndex={300}
                  >
                    <Menu.Target>
                      <Avatar
                        key={
                          avatarSrc ||
                          (user ? user.id : "app-layout-avatar-collapsed")
                        }
                        src={avatarSrc}
                        radius="xl"
                        alt={
                          user.username ||
                          t("userAvatarAlt", {
                            ns: "app",
                            defaultValue: "User avatar",
                          })
                        }
                        color="cyan"
                        sx={{
                          cursor: "pointer",
                          border: `2px solid ${theme.colors.cyan[5]}40`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                            border: `2px solid ${theme.colors.cyan[5]}`,
                          },
                        }}
                      >
                        {!avatarSrc && user.username ? (
                          user.username.substring(0, 2).toUpperCase()
                        ) : !avatarSrc ? (
                          <IconUser size={18} />
                        ) : null}
                      </Avatar>
                    </Menu.Target>
                    <Menu.Dropdown
                      sx={{
                        border: `1px solid ${
                          dark ? theme.colors.dark[4] : theme.colors.gray[3]
                        }`,
                        boxShadow: dark
                          ? `0 8px 24px ${theme.colors.dark[9]}70`
                          : `0 8px 24px ${theme.colors.gray[4]}40`,
                        zIndex: 300,
                      }}
                    >
                      <Menu.Item
                        icon={<IconSettings size={14} />}
                        onClick={() => navigate("/dashboard/settings")}
                      >
                        {t("settings", { ns: "navigation" })}
                      </Menu.Item>
                      <Menu.Item
                        icon={
                          dark ? (
                            <IconSun size={14} />
                          ) : (
                            <IconMoonStars size={14} />
                          )
                        }
                        onClick={() => toggleColorScheme()}
                      >
                        {t("theme", { ns: "settings" })}
                      </Menu.Item>
                      <Menu.Item
                        icon={<IconInfoCircle size={14} />}
                        onClick={() => {
                          navigate("/about");
                        }}
                      >
                        {t("about", { ns: "navigation" })}
                      </Menu.Item>
                      <Divider />
                      <Menu.Item
                        icon={<IconLogout size={14} />}
                        onClick={handleLogout}
                        color="red"
                      >
                        {t("logout", { ns: "navigation" })}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              )}
            </Box>
          </Navbar>
        }
      >
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
        {!useLocation().pathname.match(
          /^\/dashboard\/courses\/.*\/chapters\/.*$/
        ) && <AppFooter />}
      </AppShell>

      {/* Mobile Drawer Menu */}
      {isMobile && (
        <Drawer
          opened={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          position="bottom"
          size="auto%"
          padding="md"
          withCloseButton
          overlayProps={{ opacity: 0.45, blur: 2 }}
          styles={{
            drawer: {
              // Position above bottom navigation (96px + safe area)
              maxHeight: 'calc(100% - 96px - env(safe-area-inset-bottom))',
              // Ensure it's above the bottom navigation
              zIndex: 1000,
            },
            content: {
              // Ensure content is scrollable
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
            },
          }}
        >
          <Stack spacing="sm" sx={{ height: '100%', overflow: 'hidden' }}>
            {/* Navigation Links */}
            <Box sx={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: 8,
              marginRight: -8,
              paddingBottom: 16,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { 
                background: 'transparent',
                marginTop: 8,
                marginBottom: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: dark ? theme.colors.dark[5] : theme.colors.gray[4],
                borderRadius: 3,
                '&:hover': {
                  backgroundColor: dark ? theme.colors.dark[4] : theme.colors.gray[5],
                },
              },
            }}>
              <Stack spacing="xs">
                {mainLinksData.map((link) => (
                  <MainLink
                    {...link}
                    key={`mobile-${link.to}`}
                    isActive={currentPath === link.to}
                    collapsed={false}
                    onNavigate={() => {
                      setMobileMenuOpen(false);
                    }}
                  />
                ))}
              </Stack>
            </Box>
            <Divider my="sm" sx={{ opacity: 0.6 }} />
            {/* Quick actions - enhanced styling */}
            <Paper 
              withBorder 
              p="sm" 
              radius="md"
              sx={{
                background: dark ? theme.colors.dark[7] : theme.white,
                boxShadow: theme.shadows.sm,
              }}
            >
              <Group spacing="sm" grow>
                <UnstyledButton 
                  onClick={() => toggleColorScheme()}
                  sx={{
                    padding: '8px',
                    borderRadius: theme.radius.md,
                    transition: 'all 150ms ease',
                    '&:hover': {
                      background: dark ? theme.colors.dark[6] : theme.colors.gray[0],
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  <Group position="center" spacing="xs" noWrap>
                    <ThemeIcon size={34} radius="md" variant="light" color={dark ? 'yellow' : 'blue'}>
                      {dark ? <IconSun size={18} /> : <IconMoonStars size={18} />}
                    </ThemeIcon>
                    <Text size="sm" weight={500} align="center">
                      {t("theme", { ns: "settings" })}
                    </Text>
                  </Group>
                </UnstyledButton>

                <UnstyledButton 
                  onClick={() => { setMobileMenuOpen(false); navigate("/about"); }}
                  sx={{
                    padding: '8px',
                    borderRadius: theme.radius.md,
                    transition: 'all 150ms ease',
                    '&:hover': {
                      background: dark ? theme.colors.dark[6] : theme.colors.gray[0],
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  <Group position="center" spacing="xs" noWrap>
                    <ThemeIcon size={34} radius="md" variant="light" color="gray">
                      <IconInfoCircle size={18} />
                    </ThemeIcon>
                    <Text size="sm" weight={500} align="center">
                      {t("about", { ns: "navigation" })}
                    </Text>
                  </Group>
                </UnstyledButton>

                <UnstyledButton 
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  sx={{
                    padding: '8px',
                    borderRadius: theme.radius.md,
                    transition: 'all 150ms ease',
                    '&:hover': {
                      background: theme.colors.red[0],
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  <Group position="center" spacing="xs" noWrap>
                    <ThemeIcon size={34} radius="md" variant="light" color="red">
                      <IconLogout size={18} />
                    </ThemeIcon>
                    <Text size="sm" weight={600} color="red" align="center">
                      {t("logout", { ns: "navigation" })}
                    </Text>
                  </Group>
                </UnstyledButton>
              </Group>
            </Paper>
          </Stack>
        </Drawer>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          shadow={dark ? "xl" : "sm"}
          radius={0}
          withBorder
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            borderTop: `1px solid ${dark ? theme.colors.dark[5] : theme.colors.gray[3]}`,
            background: dark ? theme.colors.dark[7] : theme.white,
          }}
        >
          <Group position="apart" px="md" py="xs">
            {[
              "/dashboard",
              "/dashboard/create-course",
              "/dashboard/public-courses",
            ].map((path) => {
              const item = mainLinksData.find((l) => l.to === path);
              if (!item) return null;
              const active = currentPath === item.to;
              return (
                <UnstyledButton
                  key={`bottom-${item.to}`}
                  onClick={() => navigate(item.to)}
                  sx={{
                    padding: bottomPadding,
                    borderRadius: 8,
                    color: active
                      ? theme.colors.blue[6]
                      : dark
                        ? theme.colors.dark[0]
                        : theme.colors.gray[7],
                  }}
                >
                  <Stack spacing={2} align="center">
                    <ThemeIcon
                      variant={active ? "filled" : "light"}
                      size={bottomIconSize}
                      color={active ? "blue" : "gray"}
                    >
                      {item.icon}
                    </ThemeIcon>
                    <Text weight={500} sx={{ whiteSpace: "nowrap", fontSize: `${bottomTextSize}px` }}>
                      {item.label}
                    </Text>
                  </Stack>
                </UnstyledButton>
              );
            })}
            {/* Mehr button opens the drawer */}
            <UnstyledButton
              key="bottom-more"
              onClick={() => setMobileMenuOpen((o) => !o)}
              sx={{
                padding: bottomPadding,
                borderRadius: 8,
                color: dark ? theme.colors.dark[0] : theme.colors.gray[7],
              }}
            >
              <Stack spacing={2} align="center">
                <ThemeIcon variant="light" size={bottomIconSize} color="gray">
                  <IconMenu2 size={Math.round(16 * scale)} />
                </ThemeIcon>
                <Text weight={500} sx={{ whiteSpace: "nowrap", fontSize: `${bottomTextSize}px` }}>
                  {t('more', { ns: 'navigation', defaultValue: 'Mehr' })}
                </Text>
              </Stack>
            </UnstyledButton>
          </Group>
        </Paper>
      )}
    </>
  );
}

export default AppLayout;
