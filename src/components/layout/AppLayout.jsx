import React, { useCallback , useEffect , useRef , useState} from 'react' 
import Header from './Header'
import Title from '../shared/Title'
import Grid2 from '@mui/material/Grid2'
import { ChatList } from '../specific/ChatList'
import { useNavigate, useParams } from 'react-router-dom'
import Profile from '../specific/Profile'
import { useMyChatsQuery } from '../../redux/api/api'
import { Skeleton , Drawer } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { setIsDeleteMenu, setIsMobile , setSelectedDeleteChat} from '../../redux/reducers/misc'
import { useErrors , useSocketEvents } from '../../hooks/hooks.jsx'
import { getSocket } from '../../sockets.jsx'
import { NEW_MESSAGE_ALERT , ONLINE_USERS , REFETCH_CHATS , NEW_REQUEST  } from '../../constants/events'
import { incrementNotification, setNewMessageAlert } from '../../redux/reducers/chat.js'
import { getOrSaveFromLocalStorge } from '../../lib/features.js'
import DeleteChatMenu from '../dialogs/DeleteChatMenu.jsx'


const AppLayout = () => (WrappedComponent) =>{
  return (props) => { 
        const params = useParams();
        const dispatch = useDispatch();
        const navigate = useNavigate();
        const chatId = params.chatId;
        const socket = getSocket() 
        const deleteMenuAnchor = useRef(null) 

        const [onlineUsers, setOnlineUsers] = useState([]);

        const {isMobile} = useSelector((state) => state.misc)
        const { user } = useSelector((state) => state.auth)
        const { newMessagesAlert } = useSelector((state) => state.chat)

        const {
          isLoading, 
          data, 
          isError, 
          error, 
          refetch,
        } = useMyChatsQuery("", {
          skip: !user?._id,
          refetchOnMountOrArgChange: true,
          refetchOnFocus: true,
          refetchOnReconnect: true,
        });
        
        useErrors([{ isError, error }]);

        useEffect(() => {
          getOrSaveFromLocalStorge({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert });
        }, [newMessagesAlert]);


        const handleDeleteChat = (e , chatId , groupChat) => {
          dispatch(setIsDeleteMenu(true))
          dispatch(setSelectedDeleteChat({ chatId, groupChat }));
          deleteMenuAnchor.current = e.currentTarget;
      } 
    

        const handleMobileClose = () => dispatch(setIsMobile(false));

        const newMessageAlertHandler = useCallback( (data) => {
            if(data.chatId === chatId) return;
            dispatch(setNewMessageAlert(data))
            console.log("done")

        },[chatId])

        const newRequestListener = useCallback( () => {
          dispatch(incrementNotification())
        },
        [dispatch])

        const refetchListener = useCallback( () => {
          refetch()
          navigate("/")
        },[refetch , navigate ])

        const onlineUsersListener = useCallback( (data) => {
          setOnlineUsers(data);
        },
        [])

        const eventHandler = {
          [NEW_MESSAGE_ALERT]: newMessageAlertHandler,
          [NEW_REQUEST]: newRequestListener,
          [REFETCH_CHATS]: refetchListener,
          [ONLINE_USERS]: onlineUsersListener,
        };  
        
        useSocketEvents(socket , eventHandler)

        return ( <>
        
           <Title/>
            <Header/>

            <DeleteChatMenu dispatch={dispatch} deleteMenuAnchor={deleteMenuAnchor}/>

            {isLoading ? (
          <Skeleton />
        ) : (
          <Drawer open={isMobile} onClose={handleMobileClose}>
            <ChatList
              w="70vw"
              chats={data?.chats}
              chatId={chatId}
              handleDeleteChat={handleDeleteChat}
              newMessagesAlert={newMessagesAlert}
              onlineUsers={onlineUsers}
            />
          </Drawer>
        )}

        <Grid2
             container direction="row" 
            height={"calc(100vh - 4rem )"}
            sx={{ justifyContent: "space-between",
             alignItems: "flex-start",}}  >

                <Grid2 
                   size = {{xs:0 , sm:4 , md:3 ,lg:3}}
                    sx={{
                    display: { xs: "none", sm: "block" } }}
                    height="100%"
                >
                {isLoading ? (<Skeleton/>) : (
                    <ChatList
                    chats={data?.chats}
                    chatId={chatId}
                    handleDeleteChat={handleDeleteChat}
                    newMessagesAlert={newMessagesAlert}
                    onlineUsers={onlineUsers}
                    />
                )}
                </Grid2>

                <Grid2 size ={{ xs:12 ,sm:8 , md:5 , lg:6}} height="100%" >
                    <WrappedComponent {...props} chatId = {chatId} />
                </Grid2>


                <Grid2
               size = {{ xs:0 , sm:4 ,md:4 , lg:3  }}
                height="100%"
                sx={{
                    display: { xs: "none", md: "block" },
                    padding: "2rem",
                    bgcolor: "rgba(0,0,0,0.85)",
                }}
                >
                    <Profile user={user} />
                </Grid2>
                </Grid2>;
                    </>
                )
                }
}

export default AppLayout