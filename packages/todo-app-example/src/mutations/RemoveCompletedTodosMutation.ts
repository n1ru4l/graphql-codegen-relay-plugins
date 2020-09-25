import {
  RemoveCompletedTodosInput,
  useRemoveCompletedTodosMutationMutation,
  TodoListFooter_UserFragment,
  RemoveCompletedTodosMutationMutation,
  TodoListFooter_UserFragmentDoc,
} from "../generated-types";
import { useCallback } from "react";
import * as Option from "../Option";
import { MutationUpdaterFn } from "apollo-client";

type Todos = Exclude<TodoListFooter_UserFragment, null>["todos"];

const createOptimisticResponse = (
  todos: Todos,
  user: TodoListFooter_UserFragment
): RemoveCompletedTodosMutationMutation => {
  const deletedTodoIds = (todos?.edges ?? [])
    .map((edge) => edge?.node)
    .filter(Option.isSome)
    .filter((node) => node.complete === true)
    .map((node) => node.id);

  return {
    __typename: "Mutation",
    removeCompletedTodos: {
      __typename: "RemoveCompletedTodosPayload",
      deletedTodoIds,
      user: {
        __typename: "User",
        id: user.id,
        completedCount: user.completedCount - deletedTodoIds.length,
        totalCount: user.totalCount - deletedTodoIds.length,
      },
    },
  };
};

const update: MutationUpdaterFn<RemoveCompletedTodosMutationMutation> = (
  dataProxy,
  result
) => {
  const deletedTodoIds = result?.data?.removeCompletedTodos?.deletedTodoIds;

  const userId = result?.data?.removeCompletedTodos?.user.id;
  if (Option.isNone(deletedTodoIds) || Option.isNone(userId)) {
    return;
  }

  const data = dataProxy.readFragment<TodoListFooter_UserFragment>({
    id: `User:${userId}`,
    fragment: TodoListFooter_UserFragmentDoc,
    fragmentName: "TodoListFooter_user",
  });

  if (
    Option.isNone(data) ||
    Option.isNone(data.todos) ||
    Option.isNone(data.todos.edges)
  ) {
    return;
  }

  const newData = {
    ...data,
    todos: {
      ...data.todos,
      edges: data.todos.edges.filter((edge) => {
        if (!edge || !edge.node) {
          return true;
        }
        return !deletedTodoIds.includes(edge.node.id);
      }),
    },
  };

  dataProxy.writeFragment<TodoListFooter_UserFragment>({
    id: `User:${userId}`,
    fragment: TodoListFooter_UserFragmentDoc,
    fragmentName: "TodoListFooter_user",
    data: newData,
  });
};

export const useRemoveCompletedTodosMutation = () => {
  const [mutate] = useRemoveCompletedTodosMutationMutation();

  return useCallback(
    (todos: Todos, user: TodoListFooter_UserFragment) => {
      const input: RemoveCompletedTodosInput = {
        userId: user.userId,
      };

      return mutate({
        variables: { input },
        optimisticResponse: createOptimisticResponse(todos, user),
        update,
      });
    },
    [mutate]
  );
};
