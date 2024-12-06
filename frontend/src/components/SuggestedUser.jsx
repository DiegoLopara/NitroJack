import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";

const SuggestedUser = ({ user }) => {
  const currentUser = useRecoilValue(userAtom);
  const [following, setFollowing] = useState(
    user.followers.includes(currentUser?._id)
  );
  const showToast = useShowToast();
  const [updating, setUpdating] = useState(false);

    const handleFollowUnFollow = async () => {
      if (!currentUser) {
        showToast("Error", "Por favor haz login para seguir", "error");
        return;
      }
      if (updating) return;
      setUpdating(true);
      try {
        const res = await fetch(`/api/users/follow/${user._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        if (following) {
          showToast("Success", `Ha dejado de seguir ${user.name}`, "success");
          user.followers.pop();
        } else {
          showToast("Success", `Le ha dado a seguir a ${user.name}`, "success");
          user.followers.push(currentUser?._id);
        }
        setFollowing(!following);
        console.log(data);
      } catch (error) {
        showToast("Error", error, "error");
      } finally {
        setUpdating(false);
      }
    };

  return (
    <Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
      <Flex gap={2} as={Link} to={`${user.username}`}>
        <Avatar src={user.profilePic} />
        <Box>
          <Text fontSize={"sm"} fontWeight={"bold"}>
            {user.username}
          </Text>
          <Text color={"gray.light"} fontSize={"sm"}>
            {user.name}
          </Text>
        </Box>
      </Flex>
      <Button
        size={"sm"}
        color={following ? "black" : "white"}
        bg={following ? "white" : "blue.400"}
        onClick={handleFollowUnFollow}
        isLoading={updating}
        _hover={{
          color: following ? "black" : "white",
          opacity: ".8",
        }}
      >
        {following ? "Dejar de seguir" : "Seguir"}
      </Button>
    </Flex>
  );
};

export default SuggestedUser;
