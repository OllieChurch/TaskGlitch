// Dropdown options for string-enum settings
export const settingOptions = {
	rescheduling: {
		onEarlyCompletion: [
			{ value: 'reschedule', label: 'Reschedule remaining tasks' },
			{ value: 'insertBreak', label: 'Insert a break' }
		]
	}
}

export const settingLabels = {
	_groups: {
		taskLength: 'Task Length',
		rescheduling: 'Rescheduling',
		breaks: 'Breaks'
	},
	taskLength: {
		short: 'Short task',
		mid: 'Medium task',
		long: 'Long task',
		veryLong: 'Very long task'
	},
	rescheduling: {
		maintainFinishTime: 'Maintain finish time',
		onEarlyCompletion: 'On early completion'
	},
	breaks: {
		targetFrequency: 'Break frequency',
		length: 'Break length'
	}
}
