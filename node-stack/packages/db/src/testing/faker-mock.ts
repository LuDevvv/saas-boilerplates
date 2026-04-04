export const faker = {
  person: {
    fullName: () => `Test User ${Math.random().toString(36).slice(2, 7)}`,
    firstName: () => 'Test',
    lastName: () => 'User',
  },
  internet: {
    email: () => `test-${Math.random().toString(36).slice(2, 10)}@example.com`,
    password: () => 'Password123!',
    url: () => 'https://example.com',
  },
  string: {
    uuid: () => `${Math.random().toString(36).slice(2, 10)}-0000-0000-0000-000000000000`,
    alphanumeric: ({ length }: { length: number }) => Math.random().toString(36).slice(2, 2 + length).padEnd(length, 'z'),
    numeric: ({ length }: { length: number }) => Math.random().toString().slice(2, 2 + length).padEnd(length, '0'),
  },
  company: {
    name: () => `Test Company ${Math.random().toString(36).slice(2, 7)}`,
  },
  lorem: {
    slug: (count?: number) => `test-slug-${Math.random().toString(36).slice(2, 10)}`,
    sentence: () => 'Test sentence.',
    paragraph: () => 'Test paragraph.',
  },
  helpers: {
    slugify: (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  }
};
