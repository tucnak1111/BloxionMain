local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")

local TimeTracker = require(script.TimeTrackerModule)

local API_URL = ""

Players.PlayerAdded:Connect(function(player)
    TimeTracker.StartTracking(player)
end)

Players.PlayerRemoving:Connect(function(player)
    local totalTime = TimeTracker.StopTracking(player)

    
    local body = {
        userId = player.UserId,
        time = totalTime
    }

    task.spawn(function()
        HttpService:PostAsync(
            API_URL,
            HttpService:JSONEncode(body),
            Enum.HttpContentType.ApplicationJson
        )
    end)
end)