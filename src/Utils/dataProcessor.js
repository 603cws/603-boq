const processData = (data, type) => {
    if (!data || data.length === 0) return null;

    const latestData = data[0];
    const processedData = {
        linear: latestData.linear,
        ltype: latestData.lType,
        md: latestData.md,
        manager: latestData.manager,
        small: latestData.small,
        ups: latestData.ups,
        bms: latestData.bms,
        server: latestData.server,
        reception: latestData.reception,
        lounge: latestData.lounge,
        sales: latestData.sales,
        phonebooth: latestData.phoneBooth,
        discussionroom: latestData.discussionRoom,
        interviewroom: latestData.interviewRoom,
        conferenceroom: latestData.conferenceRoom,
        boardroom: latestData.boardRoom,
        meetingroom: latestData.meetingRoom,
        meetingroomlarge: latestData.meetingRoomLarge,
        hrroom: latestData.hrRoom,
        financeroom: latestData.financeRoom,
        videorecordingroom: latestData.videoRecordingRoom,
        breakoutroom: latestData.breakoutRoom,
        executivewashroom: latestData.executiveWashroom,
        totalArea: type === "areas" ? latestData.totalArea : undefined,

        openworkspaces: latestData.linear + latestData.lType,
        cabins: latestData.md + latestData.manager + latestData.small,
        meetingrooms:
            latestData.discussionRoom +
            latestData.interviewRoom +
            latestData.conferenceRoom +
            latestData.boardRoom +
            latestData.meetingRoom +
            latestData.meetingRoomLarge +
            latestData.hrRoom +
            latestData.financeRoom +
            latestData.sales +
            latestData.videoRecordingRoom,
        publicspaces:
            latestData.reception +
            latestData.lounge +
            latestData.phoneBooth +
            latestData.breakoutRoom,
        supportspaces:
            latestData.ups +
            latestData.bms +
            latestData.server +
            (latestData.other || 0) +
            latestData.executiveWashroom,

        allareas:
            latestData.linear +
            latestData.lType +
            latestData.md +
            latestData.manager +
            latestData.small +
            latestData.discussionRoom +
            latestData.interviewRoom +
            latestData.conferenceRoom +
            latestData.boardRoom +
            latestData.meetingRoom +
            latestData.meetingRoomLarge +
            latestData.hrRoom +
            latestData.financeRoom +
            latestData.sales +
            latestData.videoRecordingRoom +
            latestData.reception +
            latestData.lounge +
            latestData.phoneBooth +
            latestData.breakoutRoom +
            latestData.ups +
            latestData.bms +
            latestData.server +
            (latestData.other || 0) +
            latestData.executiveWashroom,
    };

    return processedData;
};

// Export the function for external use
export default processData;
