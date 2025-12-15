const API_URL = 'https://brainbattle-backend-7y13.onrender.com/api';

// Helper functions for role-specific localStorage
function getToken(role = null) {
  // If role is provided, get that role's token
  if (role === 'admin') {
    return localStorage.getItem('adminToken');
  } else if (role === 'user') {
    return localStorage.getItem('userToken');
  }
  // Otherwise, try to get token from current user's role
  const user = getUser();
  if (user && user.role === 'admin') {
    return localStorage.getItem('adminToken');
  } else if (user && user.role === 'user') {
    return localStorage.getItem('userToken');
  }
  // Fallback to old token for backward compatibility
  return localStorage.getItem('token');
}

function getUser(role = null) {
  // If role is provided, get that role's user
  if (role === 'admin') {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser ? JSON.parse(adminUser) : null;
  } else if (role === 'user') {
    const userUser = localStorage.getItem('userUser');
    return userUser ? JSON.parse(userUser) : null;
  }
  // Otherwise, try to get user from current role
  const adminUser = localStorage.getItem('adminUser');
  const userUser = localStorage.getItem('userUser');
  if (adminUser) {
    const admin = JSON.parse(adminUser);
    if (admin.role === 'admin') return admin;
  }
  if (userUser) {
    const user = JSON.parse(userUser);
    if (user.role === 'user') return user;
  }
  // Fallback to old user for backward compatibility
  const oldUser = localStorage.getItem('user');
  return oldUser ? JSON.parse(oldUser) : null;
}

function setAuth(token, user) {
  const role = user.role;
  if (role === 'admin') {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
  } else if (role === 'user') {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userUser', JSON.stringify(user));
  }
  // Also set old keys for backward compatibility (but these will be overwritten)
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth(role = null) {
  if (role === 'admin') {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  } else if (role === 'user') {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userUser');
  } else {
    // Clear both roles
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userUser');
    // Also clear old keys
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export async function signup(data) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (res.ok && result.token) {
    setAuth(result.token, result.user);
  }
  return result;
}

export async function getQuizzes() {
  try {
    const res = await fetch(`${API_URL}/quizzes`);
    if (!res.ok) {
      throw new Error('Failed to fetch quizzes');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
}

export async function getQuiz(id) {
  const res = await fetch(`${API_URL}/quizzes/${id}`);
  return res.json();
}

export async function createQuiz(data) {
  const token = getToken('admin');
  const res = await fetch(`${API_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function submitQuiz(quizId, answers) {
  const token = getToken('user');
  if (!token) {
    return { error: 'No token found. Please login again.' };
  }
  try {
    const res = await fetch(`${API_URL}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ answers }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to submit quiz' }));
      console.error('Submit quiz error:', errorData);
      return { error: errorData.message || 'Failed to submit quiz' };
    }
    
    const data = await res.json();
    console.log('Quiz submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return { error: error.message || 'Network error while submitting quiz' };
  }
}

export async function getResults({ quizId, userId } = {}) {
  // Try to get token based on current user's role
  const user = getUser();
  const role = user ? user.role : null;
  const token = getToken(role);
  if (!token) {
    console.warn('No token found for getResults');
    return [];
  }
  let url = `${API_URL}/quizzes/results`;
  const params = [];
  if (quizId) params.push(`quizId=${quizId}`);
  if (userId) params.push(`userId=${userId}`);
  if (params.length) url += `?${params.join('&')}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        // Token invalid - but don't auto logout, just return empty
        console.warn('Authentication failed - token may be expired');
        return [];
      }
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch results' }));
      console.error('Error fetching results:', errorData.message);
      return [];
    }
    
    const data = await res.json();
    console.log('getResults response:', {
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : 0,
      data: data
    });
    
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      // If it's an object with error, return empty array
      if (data.error) {
        console.error('Results API returned error:', data.error);
        return [];
      }
      // If it's a single result, wrap in array
      return [data];
    }
    return [];
  } catch (error) {
    console.error('Network error fetching results:', error);
    return [];
  }
}

export async function getLeaderboard(quizId) {
  // Try to get token based on current user's role
  const user = getUser();
  const role = user ? user.role : null;
  const token = getToken(role);
  if (!token) {
    return [];
  }
  try {
    const res = await fetch(`${API_URL}/quizzes/leaderboard/${quizId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        console.warn('Authentication failed');
        return [];
      }
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch leaderboard' }));
      console.error('Error fetching leaderboard:', errorData.message);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function forgotPassword(email, newPassword) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
  return res.json();
}

// Export auth helper functions
export { getToken, getUser, setAuth, clearAuth }; 