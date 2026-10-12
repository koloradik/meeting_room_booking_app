export type RoomType = {
  id: string;
  name: string;
  description: string;
};

export type UserType = {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

export type MemberType = {
  uid: string;
  email: string;
  role: "admin" | "user";
};

export type BookingType = {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  memberIds: string[];
  members: MemberType[];
  myRole: "admin" | "user";
};
