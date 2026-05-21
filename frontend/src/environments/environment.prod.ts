// Author: S2401265 Ahmed Aslan Ibrahim
export const environment = {
  production: true,
  apiRoot: '/api',
  defaultHotelId: 1,
  useMocks: false,
  demoUsers: [
    { role: 'Admin',   name: 'Admin User',      email: 'admin@grandplaza.com',   password: 'Admin@1234!'   },
    { role: 'Manager', name: 'Aishath Latheef', email: 'manager@grandplaza.com', password: 'Manager@1234!' },
    { role: 'Staff',   name: 'Mohamed Shifan',  email: 'staff@grandplaza.com',   password: 'Staff@1234!'   },
    { role: 'Guest',   name: 'Grace Taylor',    email: 'guest@example.com',      password: 'Guest@1234!'   },
  ],
};
