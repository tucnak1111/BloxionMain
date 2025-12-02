local TimeTracker = {}

-- Stores per-player data:
-- { [player.UserId] = { start = tick(), total = xx } }
local tracked = {}

function TimeTracker.StartTracking(player)
    local id = player.UserId
    tracked[id] = {
        start = tick(),
        total = 0
    }
end

function TimeTracker.StopTracking(player)
    local id = player.UserId
    local data = tracked[id]

    if not data then
        return 0
    end

    -- time spent this session
    local sessionTime = tick() - data.start
    data.total += sessionTime

    local final = data.total
    tracked[id] = nil -- remove from memory

    return final
end

return TimeTracker