//=====================================
//  SIMPLE CACHING SYSTEM IS USED TO SAVE ALL PARTY DATA
//  ONLY SERVES AS SIMPLE EXAMPLE, NORMALLY ALL THIS WOULD BE SAVED IN A DB !!
//  NOTE: ALL VALUES SAVED IN THIS CACHE WILL BE LOST ON SERVER REBOOT
//-------------------------------------

// Libs & utils
import NodeCache from 'node-cache'

export default new NodeCache( )