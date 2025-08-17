import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Table,
  Group,
  Button,
  TextInput,
  ActionIcon,
  Badge,
  Paper,
  Modal,
  PasswordInput,
  Switch,
  Text,
  Tabs,
  Box,
  Card,
  Grid,
  useMantineTheme,
  Skeleton,
  Alert,
  Select,
  Tooltip,
  Avatar,
  Loader,
} from '@mantine/core';
import { 
  IconTrash, 
  IconEdit, 
  IconLock, 
  IconAlertCircle, 
  IconSearch, 
  IconUser, 
  IconUserExclamation, 
  IconUserCheck, 
  IconChartPie, 
  IconRefresh,
  IconCheck,
  IconX,
  IconShieldCheck,
  IconLogin
} from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import userService from '../api/userService';
import authService from '../api/authService';
import { useDisclosure } from '@mantine/hooks';


// Helper function to determine MIME type from base64 string
function getMimeTypeFromBase64(base64String) {
  if (!base64String) return 'image/png'; // Default or handle error
  if (base64String.startsWith('/9j/')) return 'image/jpeg';
  if (base64String.startsWith('iVBOR')) return 'image/png';
  if (base64String.startsWith('R0lGOD')) return 'image/gif';
  if (base64String.startsWith('UklGR')) return 'image/webp';
  return 'image/png'; // Fallback
}

function AdminView() {
  const { t } = useTranslation('adminView');
  const theme = useMantineTheme();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });
  const [deleteModal, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [editModal, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [passwordModal, { open: openPassword, close: closePassword }] = useDisclosure(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    is_active: true,
    is_admin: false
  });
  const [newPassword, setNewPassword] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0
  });

  


  // Fetch users on initial render and update filtered users when search term or active tab changes
  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
      // Filter users after they are loaded
      filterUsers();
    };
    
    loadUsers();
  }, []);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortableHeader = ({ children, sortKey }) => {
    const isActive = sortConfig.key === sortKey;
    const isAscending = sortConfig.direction === 'asc';
    
    return (
      <th 
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => handleSort(sortKey)}
      >
        <Group spacing={4} noWrap>
          {children}
          {isActive && (
            <span style={{ display: 'inline-flex', flexDirection: 'column' }}>
              <span style={{ lineHeight: '0.6', opacity: isAscending ? 1 : 0.5 }}>▲</span>
              <span style={{ lineHeight: '0.6', opacity: !isAscending ? 1 : 0.5 }}>▼</span>
            </span>
          )}
        </Group>
      </th>
    );
  };

  // Sort users based on sort configuration
  const sortedUsers = useMemo(() => {
    if (!filteredUsers.length) return [];
    
    return [...filteredUsers].sort((a, b) => {
      let aValue, bValue;
      
      // Handle different data types for sorting
      switch (sortConfig.key) {
        case 'learningTime':
          aValue = a.total_learn_time || 0;
          bValue = b.total_learn_time || 0;
          break;
        case 'status':
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        case 'role':
          aValue = a.is_admin ? 1 : 0;
          bValue = b.is_admin ? 1 : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
        case 'lastLogin':
          aValue = a.last_login ? new Date(a.last_login).getTime() : 0;
          bValue = b.last_login ? new Date(b.last_login).getTime() : 0;
          break;
        default:
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
      }
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number/date comparison
      return sortConfig.direction === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    });
  }, [filteredUsers, sortConfig]);

  // Update filtered users when search term, users, or active tab changes
  useEffect(() => {
    // Only filter if users are already loaded
    if (users.length > 0) {
      filterUsers();
    }
  }, [searchTerm, users, activeTab]);

  // Calculate user stats when users change
  useEffect(() => {
    if (users.length > 0) {
      setUserStats({
        total: users.length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        admins: users.filter(u => u.is_admin).length
      });
    }
  }, [users]);

  const formatDate = (dateString) => {
    console.log("Given Date String: ", dateString);
    if (!dateString) return '';
    try {
      let processedDateString = dateString;
      if (typeof dateString === 'string') {
        // Case 1: Input is 'YYYY-MM-DD HH:MM:SS(.sss)' (space separator)
        // Convert to 'YYYY-MM-DDTHH:MM:SS(.sss)Z' to ensure UTC parsing
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d*)?$/.test(dateString)) {
          processedDateString = dateString.replace(' ', 'T') + 'Z';
        }
        // Case 2: Input is 'YYYY-MM-DDTHH:MM:SS(.sss)' (T separator, no Z or offset)
        // Append 'Z' to ensure UTC parsing
        else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d*)?$/.test(dateString) &&
                 !dateString.endsWith('Z') &&
                 !/[+-]\d{2}:\d{2}$/.test(dateString) &&
                 !/[+-]\d{4}$/.test(dateString)) { // Also check for +-HHMM offset
          processedDateString = dateString + 'Z';
        }
      }
  
      const date = new Date(processedDateString);
      console.log("Processed Date String: ", processedDateString);
      console.log("Date Object: ", date);
      
      if (isNaN(date.getTime())) {
        // Fallback if processing failed, try original string directly
        const fallbackDate = new Date(dateString); 
        if (isNaN(fallbackDate.getTime())) {
          console.warn("Invalid date string received (tried processed and original):", dateString);
          return ''; 
        }
        // Use fallbackDate for formatting
        return fallbackDate.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
  
      // Format using the (UTC-parsed then localized) date object
      return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return '';
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      console.log('Fetched users:', data);
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(t('errors.loadUsersGeneral'));
      toast.error(t('toast.loadUsersError'));
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(u => u.is_active);
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(u => !u.is_active);
    } else if (activeTab === 'admins') {
      filtered = filtered.filter(u => u.is_admin);
    }
    
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser.id);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== selectedUser.id));
      toast.success(t('toast.userDeletedSuccess', { username: selectedUser.username }));
      closeDelete();
    } catch (err) {
      toast.error(t('toast.deleteUserError'));
      if (err.response.status === 403) {
        toast.warning(t('toast.cannotDeleteSelf'));
      }
      console.error('Failed to delete user:', err);
    }
  };

  const handleEditUser = async () => {
    try {
      const updatedUser = await userService.adminUpdateUser(selectedUser.id, editForm);
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === selectedUser.id ? updatedUser : u)
      );
      toast.success(t('toast.userUpdatedSuccess', { username: editForm.username }));
      closeEdit();
    } catch (err) {
      toast.error(t('toast.updateUserError'));
      console.error('Failed to update user:', err);
    }
  };

  const handlePasswordChange = async () => {
    try {
      await userService.adminChangePassword(selectedUser.id, newPassword);
      toast.success(t('toast.passwordChangedSuccess', { username: selectedUser.username }));
      closePassword();
    } catch (err) {
      toast.error(t('toast.passwordChangeError'));
      console.error('Failed to change password:', err);
    }
  };

  const [isLoggingInAs, setIsLoggingInAs] = useState(null);

  const handleLoginAsUser = async (userId) => {
    setIsLoggingInAs(userId);
    try {
      await authService.adminLoginAs(userId);
      // Show success message before redirect
      toast.success(t('toast.loginAsSuccess'));
      // Small delay to show the success message, then redirect to dashboard with full page reload
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err) {
      console.error('Failed to login as user:', err);
      const errorMessage = err.message || t('toast.loginAsError');
      toast.error(errorMessage);
    } finally {
      setIsLoggingInAs(null);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      is_active: user.is_active,
      is_admin: user.is_admin
    });
    openEdit();
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    openPassword();
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    openDelete();
  };

  // Check if current user is admin
  useEffect(() => {
    if (currentUser && !currentUser.is_admin) {
      toast.warning(t('toast.cannotRevokeAdminSelf'));
      navigate('/');
    }
  }, [currentUser, navigate, t]);

  if (!currentUser || !currentUser.is_admin) {
    return (
      <Box p="md">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title={t('accessDenied.title')} 
          color="red"
        >
          {t('accessDenied.message')}
        </Alert>
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color }) => (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group position="apart" align="center" mb="xs">
        <Text weight={500} size="lg">{title}</Text>
        <ActionIcon color={color} variant="light" radius="xl" size="lg">
          {icon}
        </ActionIcon>
      </Group>
      <Text size="xl" weight={700}>{value}</Text>
    </Card>
  );
  return (
    <Box p="md">
      <Box mb={30}>
        <Group position="apart" mb="xl">
          <Title order={2}>
            <Group spacing="xs">
              <IconShieldCheck size={28} style={{ color: theme.colors.violet[6] }} />
              <span>{t('title')}</span>
            </Group>
          </Title>
          <Text color="dimmed" size="sm">
            {t('subtitle')}
          </Text>
        </Group>
        
        {/* Stats Cards */}
        <Grid mb="lg">
          <Grid.Col span={3}>
            <StatCard 
              title={t('stats.totalUsers')} 
              value={userStats.total} 
              icon={<IconUser size={20} />}
              color="blue"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <StatCard 
              title={t('stats.activeUsers')} 
              value={userStats.active} 
              icon={<IconUserCheck size={20} />}
              color="green"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <StatCard 
              title={t('stats.inactiveUsers')} 
              value={userStats.inactive} 
              icon={<IconUserExclamation size={20} />}
              color="orange"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <StatCard 
              title={t('stats.administrators')} 
              value={userStats.admins} 
              icon={<IconChartPie size={20} />}
              color="violet"
            />
          </Grid.Col>
        </Grid>
      </Box>

      <Paper shadow="xs" p="md" mb="md">
        <Group
          mb="md"
          sx={(theme) => ({
            flexDirection: 'column',
            alignItems: 'stretch',
            [theme.fn.largerThan('sm')]: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
          })}
        >
          <TextInput
            placeholder={t('search for a user')}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            icon={<IconSearch size={16} />}
            sx={(theme) => ({ 
              flexGrow: 1, 
              [theme.fn.smallerThan('sm')]: { 
                marginRight: 0, 
                marginBottom: theme.spacing.sm 
              },
              [theme.fn.largerThan('sm')]: {
                marginRight: theme.spacing.md,
              }
            })}
          />
          <Button 
            leftIcon={<IconRefresh size={16} />} 
            onClick={fetchUsers} 
            variant="outline" 
            sx={(theme) => ({
              [theme.fn.smallerThan('sm')]: {
                width: '100%',
              }
            })}
          >
            {t('buttons.refresh')}
          </Button>
        </Group>

        <Tabs value={activeTab} onTabChange={setActiveTab} mb="md">
          <Tabs.List>
            <Tabs.Tab value="all" icon={<IconUser size="0.8rem" />}>{t('tabs.allUsers')}</Tabs.Tab>
            <Tabs.Tab value="active" icon={<IconUserCheck size="0.8rem" />}>{t('tabs.activeUsers')}</Tabs.Tab>
            <Tabs.Tab value="inactive" icon={<IconUserExclamation size="0.8rem" />}>{t('tabs.inactiveUsers')}</Tabs.Tab>
            <Tabs.Tab value="admins" icon={<IconChartPie size="0.8rem" />}>{t('tabs.administrators')}</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title={t('errors.title')} color="red" mb="md">
            {error}
          </Alert>
        )}

        {loading ? (
          <>
            <Skeleton height={40} mb="sm" />
            <Skeleton height={40} mb="sm" />
            <Skeleton height={40} mb="sm" />
            <Skeleton height={40} mb="sm" />
          </> // Corrected closing tag for JSX Fragment
        ) : (
          // Table to display when not loading
          <Box sx={{ overflowX: 'auto' }}>
            <Table striped highlightOnHover withBorder withColumnBorders verticalSpacing="sm" sx={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>{t('table.headers.profilePicture')}</th>
                  <SortableHeader sortKey="username">
                    {t('table.headers.username')}
                  </SortableHeader>
                  <th>{t('table.headers.email')}</th>
                  <SortableHeader sortKey="learningTime">
                    {t('table.headers.learningTime')}
                  </SortableHeader>
                  <SortableHeader sortKey="status">
                    {t('table.headers.status')}
                  </SortableHeader>
                  <SortableHeader sortKey="role">
                    {t('table.headers.role')}
                  </SortableHeader>
                  <SortableHeader sortKey="createdAt">
                    {t('table.headers.createdAt')}
                  </SortableHeader>
                  <SortableHeader sortKey="lastLogin">
                    {t('table.headers.lastLogin')}
                  </SortableHeader>
                  <th>{t('table.headers.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length > 0 ? (
                  sortedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        {user.profile_image_base64 ? (
                          <img
                            src={`data:${getMimeTypeFromBase64(user.profile_image_base64)};base64,${user.profile_image_base64}`}
                            alt={t('table.profilePictureAlt', { username: user.username })}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Text size="sm" color="dimmed">{t('table.noProfilePicture')}</Text>
                        )}
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.total_learn_time != null ? `${Math.floor(user.total_learn_time / 3600)}h ${Math.floor((user.total_learn_time % 3600) / 60)}m` : '?'}</td>
                      <td>
                        <Badge
                          color={user.is_active ? 'green' : 'red'}
                          variant="light"
                        >
                          {user.is_active ? t('table.status.active') : t('table.status.inactive')}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          color={user.is_admin ? 'violet' : 'blue'}
                          variant="light"
                        >
                          {user.is_admin ? t('table.role.admin') : t('table.role.user')}
                        </Badge>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>{formatDate(user.last_login)}</td>
                      <td>
                        <Group spacing="xs">
                          <Tooltip label={t('table.actions.editUser')}>
                            <ActionIcon 
                              color="blue" 
                              onClick={() => openEditModal(user)}
                              disabled={user.id === currentUser.id && user.is_admin} // Prevent admin from editing their own core details if they are an admin
                            >
                              <IconEdit size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('table.actions.changePassword')}>
                            <ActionIcon 
                              color="yellow" 
                              onClick={() => openPasswordModal(user)}
                            >
                              <IconLock size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('table.actions.deleteUser')}>
                            <ActionIcon 
                              color="red" 
                              onClick={() => openDeleteModal(user)}
                              disabled={user.id === currentUser.id} // Prevent self-deletion
                            >
                              <IconTrash size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('table.actions.loginAsUser')}>
                            <ActionIcon 
                              color="green" 
                              onClick={() => handleLoginAsUser(user.id)}
                              disabled={user.id === currentUser.id || isLoggingInAs === user.id || user.is_admin}
                              loading={isLoggingInAs === user.id}
                            >
                              {isLoggingInAs === user.id ? (
                                <Loader size="1rem" />
                              ) : (
                                <IconLogin size="1rem" />
                              )}
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px 0' }}>
                      {t('table.noUsersFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* Edit User Modal */}
      <Modal
        opened={editModal}
        onClose={closeEdit}
        title={t('editModal.title', { username: selectedUser?.username })}
        size="md"
      >
        <TextInput
          label={t('editModal.usernameLabel')}
          placeholder={t('editModal.usernamePlaceholder')}
          value={editForm.username}
          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
          required
          mb="md"
        />
        
        <TextInput
          label={t('editModal.emailLabel')}
          placeholder={t('editModal.emailPlaceholder')}
          value={editForm.email}
          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          required
          mb="md"
        />
        
        <Group position="apart" mb="md">
          <Text>{t('editModal.activeStatusLabel')}</Text>
          <Switch
            checked={editForm.is_active}
            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
            color="green"
            size="md"
            onLabel={<IconCheck size="1rem" />}
            offLabel={<IconX size="1rem" />}
          />
        </Group>
        
        <Group position="apart" mb="md">
          <Text>{t('editModal.adminPrivilegesLabel')}</Text>
          <Switch
            checked={editForm.is_admin}
            onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
            color="violet"
            size="md"
            onLabel={<IconCheck size="1rem" />}
            offLabel={<IconX size="1rem" />}
          />
        </Group>
        
        <Group position="right" mt="xl">
          <Button variant="outline" onClick={closeEdit}>{t('buttons.cancel')}</Button>
          <Button onClick={handleEditUser}>{t('editModal.saveChangesButton')}</Button>
        </Group>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        opened={passwordModal}
        onClose={closePassword}
        title={t('passwordModal.title', { username: selectedUser?.username })}
        size="md"
      >
        <Text color="dimmed" size="sm" mb="md">
          {t('passwordModal.description')}
        </Text>
        
        <PasswordInput
          label={t('passwordModal.newPasswordLabel')}
          placeholder={t('passwordModal.newPasswordPlaceholder')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        
        <Group position="right" mt="xl">
          <Button variant="outline" onClick={closePassword}>{t('buttons.cancel')}</Button>
          <Button onClick={handlePasswordChange} color="yellow">{t('passwordModal.changePasswordButton')}</Button>
        </Group>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        opened={deleteModal}
        onClose={closeDelete}
        title={t('deleteModal.title')}
        size="md"
      >
        <Text mb="xl">
          {t('deleteModal.confirmation', { username: selectedUser?.username, BOLD: (chunks) => <b>{chunks}</b> })}
        </Text>
        
        <Group position="right">
          <Button variant="outline" onClick={closeDelete}>{t('buttons.cancel')}</Button>
          <Button color="red" onClick={handleDeleteUser}>{t('deleteModal.deleteButton')}</Button>        </Group>
      </Modal>
    </Box>
  );
}

export default AdminView;
