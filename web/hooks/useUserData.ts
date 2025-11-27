import { GetAllUser } from "@/services/userApi"
import { set } from "date-fns";
import { useCallback, useEffect, useState } from "react"

export const useUserData = () => {

  const [users, setUsers] = useState([]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await GetAllUser();
      if (response.success) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.log('error fetch all users', error);
    }
  }, [])

  useEffect(() => {
    fetchAllUsers()
  }, [])

  return {
    users,

    setUsers,
  }
}