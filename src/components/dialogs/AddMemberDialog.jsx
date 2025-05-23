import {Button,Dialog,DialogTitle,Skeleton,Stack,Typography,} from "@mui/material";
import React, { useState } from "react";
import UserItem from "../shared/UserItem"; 
import { useDispatch, useSelector } from "react-redux";
import { setIsAddMember } from "../../redux/reducers/misc";
import { useAddGroupMembersMutation, useAvailableFriendsQuery } from "../../redux/api/api";
import { useAsyncMutation, useErrors } from "../../hooks/hooks";

  const AddMemberDialog = ({chatId}) => {

    const dispatch = useDispatch()

    const {isLoading , data , isError , error } = useAvailableFriendsQuery(chatId)
    const [addMember , isLoadingAddMembers] = useAsyncMutation(useAddGroupMembersMutation)
    const {isAddMember} = useSelector((state) => state.misc)


    const [selectedMembers, setSelectedMembers] = useState([]);
  
    const selectMemberHandler = (id) => {
      setSelectedMembers((prev) =>
        prev.includes(id)
          ? prev.filter((currElement) => currElement !== id)
          : [...prev, id]
      );
    };
  
    const closeHandler = () => {
        dispatch(setIsAddMember(false))
    };


    const addMemberSubmitHandler = () => {
      addMember("adding members..." , {members : selectedMembers , chatId})
        closeHandler();
    };
  
    useErrors([{isError , error}])
    return (
      <Dialog open={isAddMember} onClose={closeHandler}>
        <Stack p={"2rem"} width={"20rem"} spacing={"2rem"}>
          <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
  
          <Stack spacing={"1rem"}>
            { isLoading ? (<Skeleton/> 
            ) : data?.friends?.length > 0 ? (data?.friends?.map((i) => (
                <UserItem
                  key={i._id}
                  user={i}
                  handler={selectMemberHandler}
                  isAdded={selectedMembers.includes(i._id)}
                />
              ))
            ) : (
              <Typography textAlign={"center"}>No Friends</Typography>
            )}
          </Stack>
  
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-evenly"}
          >
            <Button color="error" onClick={closeHandler}>
              Cancel
            </Button>
            <Button
              onClick={addMemberSubmitHandler}
              variant="contained"
              disabled={isLoadingAddMembers}
            >
              Submit Changes
            </Button>
          </Stack>
        </Stack>
      </Dialog>
    );
  };
  
  export default AddMemberDialog;