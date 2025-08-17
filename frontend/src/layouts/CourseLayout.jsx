import { useState, useEffect } from 'react';
import { Outlet, useParams, NavLink, useNavigate } from 'react-router-dom';
import {
  AppShell,
  Navbar,
  Title,
  Group,
  Text,
  Box,
  Menu,
  Avatar,
  useMantineColorScheme,
  useMantineTheme,
  Divider,
  UnstyledButton,
  ThemeIcon,
  Stack,
  ActionIcon,
  Loader,
  Alert,
  Flex
} from '@mantine/core';
import {
  IconSettings,
  IconSun,
  IconMoonStars,
  IconLogout,
  IconUser,
  IconInfoCircle,
  IconChevronDown,
  IconBook,
  IconFileText,
  IconQuestionMark,
  IconCheck,
  IconHome2,
  IconAlertCircle,
  IconList,
  IconX,
  IconCards
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import courseService from '../api/courseService';


function CourseLayout() {
  const { courseId, chapterId } = useParams();
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t } = useTranslation(['navigation', 'app', 'settings']);
  const dark = colorScheme === 'dark';

  // Sidebar is closed by default

  const [sidebarOpened, setSidebarOpened] = useState(false);

  // ----- Fetch chapters -------------------------------------------------- //
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const chaptersData = await courseService.getCourseChapters(courseId);
        setChapters(chaptersData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch chapters:', err);
        setError('Failed to load course chapters.');
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [courseId]);

  // ----- Handlers -------------------------------------------------------- //
  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const avatarSrc = user?.profile_image_url;

  // Close sidebar after a navigation click
  const handleNavLinkClick = () => {
    setSidebarOpened(false);
  };

  // ----- Chapter list markup -------------------------------------------- //
  const chapterNavLinks = chapters.map((chapter) => (
    <Box key={chapter.id}>
      <NavLink
        to={`/dashboard/courses/${courseId}/chapters/${chapter.id}`}
        className={({ isActive }) => `chapter-nav-link ${isActive ? 'active' : ''}`}
        onClick={handleNavLinkClick}
      >
        <Group align="flex-start" spacing="sm">
          <ThemeIcon
            color={chapter.id.toString() === chapterId ? theme.primaryColor : 'gray'}
            variant="light"
          >
            {chapter.is_completed ? <IconCheck size={16} /> : <IconBook size={16} />}
          </ThemeIcon>
          <Text
            size="sm"
            weight={chapter.id.toString() === chapterId ? 700 : 400}
            sx={{ flex: 1 }}
          >
            {chapter.caption}
          </Text>
        </Group>
      </NavLink>

      {chapter.id.toString() === chapterId && (
        <Stack spacing={4} mt="xs" pl="lg">
          <NavLink
            to={`/dashboard/courses/${courseId}/chapters/${chapter.id}#content`}
            className="sub-nav-link"
            onClick={handleNavLinkClick}
          >
            <Group>
              <IconBook size={14} />
              <Text size="xs">Content</Text>
            </Group>
          </NavLink>
          <NavLink
            to={`/dashboard/courses/${courseId}/chapters/${chapter.id}?tab=flashcards`}
            className="sub-nav-link"
            onClick={handleNavLinkClick}
          >
            <Group>
              <IconCards size={14} />
              <Text size="xs">Flashcards</Text>
            </Group>
          </NavLink>
          <NavLink
            to={`/dashboard/courses/${courseId}/chapters/${chapter.id}#quiz`}
            className="sub-nav-link"
            onClick={handleNavLinkClick}
          >
            <Group>
              <IconQuestionMark size={14} />
              <Text size="xs">Quiz</Text>
            </Group>
          </NavLink>
          <NavLink
            to={`/dashboard/courses/${courseId}/chapters/${chapter.id}#documents`}
            className="sub-nav-link"
            onClick={handleNavLinkClick}
          >
            <Group>
              <IconFileText size={14} />
              <Text size="xs">Documents</Text>
            </Group>
          </NavLink>
        </Stack>
      )}
    </Box>
  ));

  // ----- Sidebar component ---------------------------------------------- //
  const Sidebar = (
    <Navbar width={{ base: 280 }} p="md">
      <Flex direction="column" h="100%">
        {/* Header row */}
        <Group position="apart">
          <ActionIcon onClick={() => navigate('/dashboard')} title="Dashboard">
            <IconHome2 />
          </ActionIcon>
          <Title order={5}>Chapters</Title>
          <ActionIcon onClick={() => setSidebarOpened(false)} title="Close sidebar">
            <IconX />
          </ActionIcon>
        </Group>

        <Divider my="sm" />

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {loading && <Loader />}    
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error}
            </Alert>
          )}
          {!loading && !error && <Stack spacing="md">{chapterNavLinks}</Stack>}
        </Box>

        {/* User menu */}
        {user && (
          <Box>
            <Divider my="sm" />
            <Menu shadow="md" width={220} withArrow>
              <Menu.Target>
                <UnstyledButton sx={{ display: 'block', width: '100%' }}>
                  <Group>
                    <Avatar src={avatarSrc} radius="xl">
                      {!avatarSrc && user.username ? (
                        user.username.substring(0, 2).toUpperCase()
                      ) : (
                        <IconUser size={18} />
                      )}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Text size="sm" weight={500}>
                        {user.username}
                      </Text>
                      <Text color="dimmed" size="xs">
                        {user.email}
                      </Text>
                    </Box>
                    <IconChevronDown size={16} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  icon={<IconSettings size={14} />}
                  onClick={() => navigate('/dashboard/settings')}
                >
                  {t('settings', { ns: 'navigation' })}
                </Menu.Item>
                <Menu.Item
                  icon={dark ? <IconSun size={14} /> : <IconMoonStars size={14} />}
                  onClick={() => toggleColorScheme()}
                >
                  {t('theme', { ns: 'settings' })}
                </Menu.Item>
                <Menu.Item
                  icon={<IconInfoCircle size={14} />}
                  onClick={() => navigate('/about')}
                >
                  {t('about', { ns: 'navigation' })}
                </Menu.Item>
                <Divider />
                <Menu.Item
                  icon={<IconLogout size={14} />}
                  onClick={handleLogout}
                  color="red"
                >
                  {t('logout', { ns: 'navigation' })}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
        )}
      </Flex>
    </Navbar>
  );

  return (
    <AppShell
      fixed
      padding={0}
      navbarOffsetBreakpoint="xs" // offset at *all* widths
      styles={{
        main: {
          background: dark ? theme.colors.dark[8] : theme.colors.gray[0],
          padding: '1rem'
        }
      }}
      navbar={sidebarOpened ? Sidebar : undefined}
    >
      {/* Toggle button (shows only when sidebar is collapsed) */}
      {!sidebarOpened && (
        <ActionIcon
          onClick={() => setSidebarOpened(true)}
          variant="default"
          size="xl"
          sx={(theme) => ({
            position: 'fixed',
            top: '50%',
            left: 0,
            zIndex: 1000,
            width: '24px',
            height: '48px',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderRadius: '0 20px 20px 0',
            border: `1px solid ${dark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
            borderLeft: 0,
            backgroundColor: dark ? theme.colors.dark[6] : theme.white,
            '&:hover': {
              backgroundColor: dark ? theme.colors.dark[5] : theme.colors.gray[1]
            }
          })}
        >
          <IconList size={16} />
        </ActionIcon>
      )}

      <Outlet />

      {/* Inline styles for navigation links */}
      <style>{`
        .chapter-nav-link {
          display: block;
          padding: 8px 12px;
          border-radius: ${theme.radius.sm};
          color: ${dark ? theme.colors.dark[0] : theme.black};
          text-decoration: none;
          transition: background-color 150ms ease;
        }
        .chapter-nav-link:hover {
          background-color: ${dark ? theme.colors.dark[5] : theme.colors.gray[1]};
        }
        .chapter-nav-link.active {
          background-color: ${dark ? theme.colors.blue[8] : theme.colors.blue[0]};
          color: ${dark ? 'white' : theme.colors.blue[7]};
        }
        .sub-nav-link {
          display: block;
          padding: 6px 8px 6px 30px;
          border-radius: ${theme.radius.sm};
          color: ${dark ? theme.colors.dark[1] : theme.colors.gray[7]};
          text-decoration: none;
          transition: background-color 150ms ease;
        }
        .sub-nav-link:hover {
          background-color: ${dark ? theme.colors.dark[6] : theme.colors.gray[0]};
        }
        .sub-nav-link.active {
          color: ${dark ? theme.white : theme.black};
        }
      `}</style>
    </AppShell>
  );
}

export default CourseLayout;
