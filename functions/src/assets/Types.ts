export type Updates = {
  [key: string]: any;
};

export type MessageData = {
  [key: string]: any;
};

export type Presence = {
  flat: {
    status: string;
    lastChanged: any;
  };
  user: {
    status: string;
    lastChanged: any;
  };
};

export type ChatInfo = {
  _id: string;
  createdAt: any;
  members: {
    [key: string]: any;
  };
  flatId: string;
  userId: string;
  title: {
    forFlat: string;
    forUser: string;
  };
  presence: any;
};
