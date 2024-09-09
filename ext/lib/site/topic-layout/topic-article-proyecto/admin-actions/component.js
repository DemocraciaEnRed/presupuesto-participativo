import React from 'react'
import t from 't-component'
import urlBuilder from 'lib/url-builder'

export default ({ topic, forum }) => {
  // let hasPriviliges = topic.priviliges && topic.privileges.canEdit
  let hasPriviliges = forum.privileges && forum.privileges.canChangeTopics
  // if (!topic.privileges.canEdit) return null
  if (!hasPriviliges) return null

  return (
    <div className='topic-article-content topic-admin-actions'>
      {hasPriviliges && (
        <a
          href={urlBuilder.for('admin.topics.id', {
            forum: forum.name,
            id: topic.id
          })}
          className='btn btn-default btn-sm'>
          <i className='icon-pencil' />
          &nbsp;
          {'Editar proyecto'}
        </a>
      )}
    </div>
  )
}
