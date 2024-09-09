import React, { Component } from 'react'
import t from 't-component'
import CommentsForm from './form/component'
import CommentsList from './list/component'
import CommentsOrderBy from './order-by/component'
import commentsConnector from './connector'
import config from 'lib/config'

export class Comments extends Component {
  constructor (props) {
    super(props)

    this.state = {
      comments: props.commentsFetch.value,
      pagination: props.commentsFetch.meta.pagination
    }
  }

  componentWillReceiveProps ({ commentsFetch }) {
    if (!commentsFetch.pending) {
      this.setState({
        comments: commentsFetch.value,
        pagination: commentsFetch.meta.pagination
      })
    }
  }

  render () {
    const { commentsFetch } = this.props

    const enabled = config.habilitarComentarios

    return (
      <div className='topic-comments'>
        <div className='topic-article-content'>
          <h2 className='topic-comments-title'>
            {t('comments.arguments')}
            <CommentsOrderBy onSort={this.props.handleSort} />
          </h2>
          {
            enabled ?
              <CommentsForm
                topic={this.props.topic}
                onSubmit={this.props.handleCreate}
                commentsCreating={this.props.commentsCreating} />
            :
              <p className=''>¡Gracias por haber comentando!<br />Los comentarios de esta sección se encuentra deshabilitada.</p>
          }
          {!commentsFetch.rejected && (
            <CommentsList
              forum={this.props.forum}
              topic={this.props.topic}
              loading={commentsFetch.pending}
              comments={this.state.comments}
              onReply={enabled && this.props.handleReply}
              commentsReplying={enabled && this.props.commentsReplying}
              onDelete={this.props.handleDelete}
              onDeleteReply={this.props.handleDeleteReply}
              commentDeleting={this.props.commentDeleting}
              onUnvote={enabled && this.props.handleUnvote}
              onUpvote={enabled && this.props.handleUpvote}
              onDownvote={enabled && this.props.handleDownvote}
              onFlag={this.props.handleFlag}
              onUnflag={this.props.handleUnflag}
              onReplyEdit={enabled && this.props.handleReplyEdit}
              onEdit={enabled && this.props.handleEdit}
              enabled={enabled} />
          )}
          {
            this.state.pagination &&
            this.state.pagination.page < this.state.pagination.pageCount &&
            (
              <div className='load-more'>
                <button
                  type='button'
                  className='btn btn-primary btn-block'
                  disabled={commentsFetch.pending}
                  onClick={this.props.handleNextPage}>
                  {t('comments.load-more')}
                </button>
              </div>
            )
          }
          {commentsFetch.rejected && (
            <div className='alert alert-danger' role='alert'>
              {t('modals.error.default')}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default commentsConnector(Comments)
