interface FriendStatus {
  status: string
  preferredStatus: string
  customMessage: string
  updatedAt?: string
}

export interface MockFriend {
  uid: string
  displayName: string
  email: string
  photoURL: string
  status: FriendStatus
}

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
  'Riley', 'Avery', 'Quinn', 'Skylar', 'Dakota'
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
]

const STATUSES = ['online', 'away', 'busy', 'offline']

const CUSTOM_MESSAGES = [
  'Playing Cyberpunk 2077',
  'Downloading games',
  'Browsing library',
  'Playing GTA V',
  'Viewing Schedule I',
  '',
  '',
  ''
]

const AVATAR_URLS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Avery',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Quinn'
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

export function generateMockFriend(index: number): MockFriend {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length]
  const lastName = randomElement(LAST_NAMES)
  const displayName = `${firstName} ${lastName}`
  const status = randomElement(STATUSES)
  const customMessage = status === 'offline' ? '' : randomElement(CUSTOM_MESSAGES)

  return {
    uid: `mock-friend-${index}-${Date.now()}`,
    displayName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    photoURL: AVATAR_URLS[index % AVATAR_URLS.length],
    status: {
      status,
      preferredStatus: status,
      customMessage,
      updatedAt: new Date().toISOString()
    }
  }
}

export function generateMockFriends(count: number = 6): MockFriend[] {
  const friends: MockFriend[] = []
  
  for (let i = 0; i < count; i++) {
    friends.push(generateMockFriend(i))
  }
  
  return friends
}

export function updateMockFriendStatus(friend: MockFriend): MockFriend {
  const shouldChangeStatus = Math.random() < 0.1
  
  if (!shouldChangeStatus) {
    return friend
  }

  const newStatus = randomElement(STATUSES)
  const newCustomMessage = newStatus === 'offline' ? '' : randomElement(CUSTOM_MESSAGES)

  return {
    ...friend,
    status: {
      ...friend.status,
      status: newStatus,
      preferredStatus: newStatus,
      customMessage: newCustomMessage,
      updatedAt: new Date().toISOString()
    }
  }
}
