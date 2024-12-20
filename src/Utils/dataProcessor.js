const processData = (data, type) => {
    if (!data || data.length === 0) return null;

    const latestData = data[0];
    const processedData = {
        linear: latestData.linear,
        ltype: latestData.ltype,
        md: latestData.md,
        manager: latestData.manager,
        small: latestData.small,
        ups: latestData.ups,
        bms: latestData.bms,
        server: latestData.server,
        reception: latestData.reception,
        lounge: latestData.lounge,
        sales: latestData.sales,
        phonebooth: latestData.phonebooth,
        discussionroom: latestData.discussionroom,
        interviewroom: latestData.interviewroom,
        conferenceroom: latestData.conferenceroom,
        boardroom: latestData.boardroom,
        meetingroom: latestData.meetingroom,
        meetingroomlarge: latestData.meetingroomlarge,
        hrroom: latestData.hrroom,
        financeroom: latestData.financeroom,
        videorecordingroom: latestData.videorecordingroom,
        breakoutroom: latestData.breakoutroom,
        executivewashroom: latestData.executivewashroom,
        totalArea: type === "areas" ? latestData.totalArea : undefined,

        openworkspaces: latestData.linear + latestData.ltype,
        cabins: latestData.md + latestData.manager + latestData.small,
        meetingrooms:
            latestData.discussionroom +
            latestData.interviewroom +
            latestData.conferenceroom +
            latestData.boardroom +
            latestData.meetingroom +
            latestData.meetingroomlarge +
            latestData.hrroom +
            latestData.financeroom +
            latestData.sales +
            latestData.videorecordingroom,
        publicspaces:
            latestData.reception +
            latestData.lounge +
            latestData.phonebooth +
            latestData.breakoutroom,
        supportspaces:
            latestData.ups +
            latestData.bms +
            latestData.server +
            (latestData.other || 0) +
            latestData.executivewashroom,

        allareas:
            latestData.linear +
            latestData.ltype +
            latestData.md +
            latestData.manager +
            latestData.small +
            latestData.discussionroom +
            latestData.interviewroom +
            latestData.conferenceroom +
            latestData.boardroom +
            latestData.meetingroom +
            latestData.meetingroomlarge +
            latestData.hrroom +
            latestData.financeroom +
            latestData.sales +
            latestData.videorecordingroom +
            latestData.reception +
            latestData.lounge +
            latestData.phonebooth +
            latestData.breakoutroom +
            latestData.ups +
            latestData.bms +
            latestData.server +
            (latestData.other || 0) +
            latestData.executivewashroom,
    };

    return processedData;
};

// Export the function for external use
export default processData;
