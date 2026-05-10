export const sendPushNotification = async (pushToken, title, body, data) => {
    if (!pushToken) return;
    
    try {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
               to: pushToken,
               sound: 'default',
               title: title,
               body: body,
               data: data
            })
         });
    } catch (err) {
        console.log("Push failed silently: ", err.message);
    }
};
