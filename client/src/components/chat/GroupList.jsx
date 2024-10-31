import { useContext } from "react";
import { GroupContext } from "../../context/GroupContext";
import { Stack } from "react-bootstrap";

const GroupList = () => {
    const { groups, setCurrentGroup, fetchGroupMessages } = useContext(GroupContext);

    const handleGroupClick = (group) => {
        setCurrentGroup(group);
        fetchGroupMessages(group._id);
    };

    return (
        <Stack className="group-list">
            {groups.map((group) => (
                <div key={group._id} onClick={() => handleGroupClick(group)}>
                    {group.name}
                </div>
            ))}
        </Stack>
    );
};

export default GroupList;