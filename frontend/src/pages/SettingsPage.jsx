import { Button, Text } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import useLogout from "../hooks/useLogout";


const SettingsPage = () => {

    const showToast = useShowToast();
    const logout = useLogout();

    const freezeAccount = async () => {
        if (!window.confirm("¿Estas seguro de que quieres congelar tu cuenta?")) return;

        try {
            const res = await fetch("/api/users/freeze", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            const data = await res.json();
            if (data.error) {
                return showToast("Error", data.error, "error");
            }

            if (data.success) {
                await logout();
                showToast("Success", "Tu cuenta se ha congelado", "success");
            }

        } catch (error) {
            showToast("Error", error.message, "error");
        }
     };
  return (
      <>
          <Text my={1} fontWeight={"bold"}>Congela tu cuenta</Text>
          <Text my={1}>Puedes descongelar tu cuenta cuando quieras logueandote.</Text>
          <Button size={"sm"} colorScheme="red" onClick={freezeAccount}>Congelar</Button>
      </>
  )
}

export default SettingsPage;