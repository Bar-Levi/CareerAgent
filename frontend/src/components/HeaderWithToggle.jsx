import React from "react";
import ProfileSyncedToggle from "./ProfileSyncedToggle";

const HeaderWithToggle = ({
  conversationTitle,
  isProfileSynced,
  chatId,
  token,
  email
}) => {
  return (
    <div className="bg-brand-primary text-white flex items-center justify-between py-3 px-4 font-bold">
      <div className="text-center flex-grow">{conversationTitle}</div>
      <ProfileSyncedToggle
        isProfileSynced={isProfileSynced}
        chatId={chatId}
        token={token}
        email={email}
      />
    </div>
  );
};

export default HeaderWithToggle;
