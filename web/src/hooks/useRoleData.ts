import { GetAllRole } from "@/services/userService"
import { set } from "date-fns";
import { useCallback, useEffect, useState } from "react"

export const useRoleData = () => {

  const [roles, setRoles] = useState([]);

  const fetchAllRoles = useCallback(async () => {
    try {
      const response = await GetAllRole();
      if (response.success) {
        setRoles(response.data);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.log('error fetch all roles', error);
    }
  }, [])

  useEffect(() => {
    fetchAllRoles()
  }, [])

  return {
    roles,
    setRoles,
  }
}