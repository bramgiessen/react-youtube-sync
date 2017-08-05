import appCache from '../cache'

export const cacheUtils = {

	addToArrayInCache: ( valueToBeAdded, cacheKey, allowDuplicates = false ) => {
		const currentValue = appCache.get ( cacheKey )
		const isDuplicate = currentValue && currentValue.indexOf(valueToBeAdded) !== -1

		if ( !currentValue ) {
			appCache.set ( cacheKey, [ valueToBeAdded ] )
		}else if((!allowDuplicates && !isDuplicate) || (allowDuplicates && isDuplicate)){
			currentValue.push(valueToBeAdded)
			appCache.set ( cacheKey, currentValue );
		}
	}

}