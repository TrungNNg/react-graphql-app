import React from 'react'

const Link = ({childen, ...props}) => (
<a {...props} target="_blank" rel="noopener noreferrer">{childen}</a>
)

export default Link;
