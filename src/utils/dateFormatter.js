export const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays = Math.floor((today - messageDay) / (1000 * 60 * 60 * 24));

    if(diffDays === 0) {
        return "Today";
    }else if(diffDays === 1) {
        return "Yesterday";
    }else if(diffDays < 7) {
        return date.toLocaleDateString("en-US", { weekday: "long" });
    }else{
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric"});
    }
};
