# tasks.py
import numpy as np
import json
import redis
from celery_app import celery
from utils.QEAO import quantum_opt

# Initialize Redis client for Pub/Sub
redis_client = redis.Redis(host='redis', port=6379, db=0)

@celery.task(bind=True)
def run_quantum_opt_task(self, task_id, QUBO_matrix, parameters, description):
    try:
        # Define a synchronous callback to send progress updates
        def sync_progress_callback(iteration, cost):
            progress_data = {
                "iteration": iteration,
                "cost": cost,
            }
            print(progress_data)
            # Publish the progress to the Redis Pub/Sub channel named after task_id
            redis_client.publish(task_id, json.dumps(progress_data))

        # Run the optimization with the progress callback
        best_bitstring, best_cost, cost_values, time_per_iteration, progress_rl_costs, progress_opt_costs = quantum_opt(
            QUBO_m=QUBO_matrix,
            c=0,
            num_layers=parameters['num_layers'],
            max_iters=parameters['max_iters'],
            nbitstrings=parameters['nbitstrings'],
            opt_time=parameters['opt_time'],
            rl_time=parameters['rl_time'],
            initial_temperature=parameters['initial_temperature'],
            progress_callback=sync_progress_callback  # Pass the synchronous callback
        )

        # After optimization is complete, prepare the final result
        result = {
            "best_bitstring": best_bitstring.tolist(),
            "best_cost": best_cost,
            "cost_values": cost_values.tolist(),
            "time_per_iteration": time_per_iteration.tolist(),
            "progress_rl_costs": progress_rl_costs.tolist(),
            "progress_opt_costs": progress_opt_costs.tolist()
        }

        final_data = {
            "final": True,
            "description": description,
            "result": result
        }

        # Publish the final result
        redis_client.publish(task_id, json.dumps(final_data))

        return 'Optimization task completed successfully'

    except Exception as e:
        # In case of error, publish the error message
        error_data = {
            "error": f"Optimization failed: {str(e)}"
        }
        redis_client.publish(task_id, json.dumps(error_data))
        return f"Optimization failed: {str(e)}"