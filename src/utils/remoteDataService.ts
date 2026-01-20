export interface Hashtag {
  name: string;
  bookmarks: number[];
}

export interface Folder {
  name: string;
  bookmarks: number[];
}

export interface Bookmark {
  id: number;
  title?: string;
  url?: string;
  description?: string;
  [key: string]: string | number | undefined;
}

const getCookieValue = (name: string): string => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return '';
};

const fetchFromServer = async <T>(endpoint: string): Promise<T[]> => {
  try {
    const serverUrl = getCookieValue('bookmarks_serverUrl') || 'http://localhost:3000';
    const username = getCookieValue('bookmarks_username');
    const password = getCookieValue('bookmarks_password');

    const url = `${serverUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Basic Auth if username and password are provided
    if (username && password) {
      const credentials = btoa(`${username}:${password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`);
    }

    const data: T[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

export const fetchHashtags = async (): Promise<Hashtag[]> => {
  return fetchFromServer<Hashtag>('/hashtags');
};

export const fetchFolders = async (): Promise<Folder[]> => {
  return fetchFromServer<Folder>('/folders');
};

export const fetchBookmarks = async (): Promise<Bookmark[]> => {
  return fetchFromServer<Bookmark>('/bookmarks');
};

export const updateHashtag = async (oldName: string, newName: string): Promise<void> => {
  try {
    const serverUrl = getCookieValue('bookmarks_serverUrl') || 'http://localhost:3000';
    const username = getCookieValue('bookmarks_username');
    const password = getCookieValue('bookmarks_password');

    const url = `${serverUrl}/hashtags/${oldName}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Basic Auth if username and password are provided
    if (username && password) {
      const credentials = btoa(`${username}:${password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ name: newName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update hashtag: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating hashtag:', error);
    throw error;
  }
};

export const updateFolder = async (oldName: string, newName: string): Promise<void> => {
  try {
    const serverUrl = getCookieValue('bookmarks_serverUrl') || 'http://localhost:3000';
    const username = getCookieValue('bookmarks_username');
    const password = getCookieValue('bookmarks_password');

    const url = `${serverUrl}/folders/${oldName}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Basic Auth if username and password are provided
    if (username && password) {
      const credentials = btoa(`${username}:${password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ name: newName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update folder: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};
